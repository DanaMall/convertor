const axios = require("axios");
const cheerio = require("cheerio");

let incomes = [

    {currency: 'EUR', sum: 400, date: "2020-03-30"},

    {currency: 'EUR', sum: 500, date: "2020-02-20"},

    {currency: 'EUR', sum: 458, date: "2020-01-31"}

];

let result = {
    totalEarned: {
        eur: 0,
        usd: 0,
        rub: 0,
        pln: 0,
        gbp: 0,
        chf: 0
    },
    totalEarnedUAH: 0,
    tax5percent: 0,
    rawData: []
}

let incomeParent = document.querySelector('.incomes')
let resultParent = document.querySelector('.result')
let rateParent = document.querySelector('.rates')
let submit = document.querySelector(".submit")
let add = document.querySelector(".add")

let addCurrency = document.querySelector('[name="add-currency"]')
let addSum = document.querySelector('[name="add-sum"]')
let addDate = document.querySelector('[name="add-date"]')




function clearResult() {
    result.totalEarned.eur = 0
    result.totalEarned.usd = 0
    result.totalEarned.rub = 0
    result.totalEarned.pln = 0
    result.totalEarned.gbp = 0
    result.totalEarned.chf = 0
    result.totalEarnedUAH = 0;
    result.tax5percent = 0;
}

function buildIncome() {
    incomeParent.innerHTML = '';
    incomes.forEach((el, i) => {
        incomeParent.innerHTML += `
            <div class="income">
                <span class="currency-value">${el.currency}</span>
                <span class="sum-value">${el.sum}</span>
                <span class="date-value">${el.date}</span>
                <button class="delete">X</button>
            </div>
        `
    })
    let deleteButtons = document.querySelectorAll('.delete');
    deleteButtons.forEach((btn, i) => {
        btn.addEventListener('click', (event) => {
            incomes.splice(i, 1);
            buildIncome();
        })
    })
}

function buildResult(res) {
    result.rawData.forEach((el, i) => {
        rateParent.innerHTML += ` 
                <div class="rate">
                    <div class="rate-currency">${el.currency}</div>
                    <div class="rate-rate">${el.rate}</div>
                    <div class="rate-date">${el.date}</div>
                </div>
                 `;
    });
    resultParent.innerHTML = `
        <div class="result-total">
            <div class="result-total-description">Євро</div>
            <div class="result-total-value">${res.totalEarned.eur}</div>
        </div>
        <div class="result-total">
            <div class="result-total-description">Доларів</div>
            <div class="result-total-value">${res.totalEarned.usd}</div>
        </div>
        <div class="result-total">
            <div class="result-total-description">Рублів</div>
            <div class="result-total-value">${res.totalEarned.rub}</div>
        </div>
        <div class="result-total">
            <div class="result-total-description">Польський злотих</div>
            <div class="result-total-value">${res.totalEarned.pln}</div>
        </div>
        <div class="result-total">
            <div class="result-total-description">Фунтів стерлінгів</div>
            <div class="result-total-value">${res.totalEarned.gbp}</div>
        </div>
        <div class="result-total">
            <div class="result-total-description">Швейцарських франків</div>
            <div class="result-total-value">${res.totalEarned.chf}</div>
        </div>
        <div class="result-total result-total-earned">
            <div class="result-total-description">Гривень</div>
            <div class="result-total-value">${res.totalEarnedUAH}</div>
        </div>
        <div class="result-total result-tax">
             <div class="result-total-description">Податок</div>
             <div class="result-total-value">${res.tax5percent}</div>
        </div>
    `
}


submit.addEventListener('click', (event) => {
    clearResult();
    rateParent.innerHTML = ``;
    getResult().then((r) => {
        buildResult(r);
        console.log(r);
    })
    localStorage.setItem('incomes', JSON.stringify(incomes));
})

add.addEventListener('click', (event) => {
    if (addCurrency.value && addSum.value && addDate.value && addSum.value.match(/\D/) === null) {
        addDate.style.border = '1px solid grey';
        incomes.push({
            currency: addCurrency.value,
            sum: +addSum.value,
            date: addDate.value,
        })
        console.log();
        addSum.value = '';
        addSum.style.border = '1px solid grey';
    }
    else if (addSum.value && addSum.value.match(/\D/) === null) {
        addSum.style.border = '1px solid grey';
    } else {
        addSum.style.border = '1px solid red';
    }
    if (!addDate.value) {
        addDate.style.border = '1px solid red';
    } else {
        addDate.style.border = '1px solid grey';
    }
    buildIncome();

})


async function getResult() {
    result.rawData = incomes.slice(0);
    for (const element of incomes) {
        let i = incomes.indexOf(element);
        let url = `https://minfin.com.ua/currency/${element.currency.toLowerCase()}/${element.date}/`;
        await axios.get(url)
            .then(response => {
                return cheerio.load(response.data);
            })
            .then(($) => {
                let rate;
                $('.mfcur-table-lg-currency-cur tr:first-of-type [data-title="Продажа"]').each(function (i, element) {
                    rate = $(this).text().replace(/\n+/g, '').split(' ')[0];
                    console.log(rate);
                    return rate;
                });
                return (rate || 0);
            })
            .then(rate => {
                result.rawData[i].rate = rate;
            })
    }
    incomes.forEach((element) => {
        if (element.currency === "EUR") {
            result.totalEarned.eur += element.sum;
        }
        if (element.currency === "USD") {
            result.totalEarned.usd += element.sum;
        }
        if (element.currency === "RUB") {
            result.totalEarned.rub += element.sum;
        }
        if (element.currency === "PLN") {
            result.totalEarned.pln += element.sum;
        }
        if (element.currency === "GBP") {
            result.totalEarned.gbp += element.sum;
        }
        if (element.currency === "CHF") {
            result.totalEarned.chf += element.sum;
        }
    })
    result.rawData.forEach(element => {
        result.totalEarnedUAH += Math.round(element.sum * element.rate);
    })
    result.tax5percent = Math.round(result.totalEarnedUAH * 0.05)
    return result;
}

if (localStorage.getItem('incomes')) {
    incomes = JSON.parse(localStorage.getItem('incomes'));
}
buildIncome();


