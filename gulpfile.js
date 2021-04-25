"use strict";

const gulp = require("gulp");
const webpack = require("webpack-stream");
const browsersync = require("browser-sync");

const {src, dest, watch, parallel, series} = require('gulp');

const dist = "./dist/";

function copyHtml() {
    return gulp.src("./src/index.html")
        .pipe(gulp.dest(dist))
        .pipe(browsersync.stream());
}

function copyCss() {
    return gulp.src("./src/css/style.css")
        .pipe(gulp.dest(dist + 'css'))
        .pipe(browsersync.stream());
}

function buildJs() {
    return gulp.src("./src/js/main.js")
        .pipe(webpack({
            mode: 'development',
            output: {
                filename: 'main.js'
            },
            watch: false,
            devtool: "source-map",
            module: {
                rules: [
                    {
                        test: /\.m?js$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [['@babel/preset-env', {
                                    debug: true,
                                    corejs: 3,
                                    useBuiltIns: "usage"
                                }]]
                            }
                        }
                    }
                ]
            }
        }))
        .pipe(gulp.dest(dist))
        .on("end", browsersync.reload);
}

function copyAssets() {
    return gulp.src("./src/assets/**/*.*")
        .pipe(gulp.dest(dist + "/assets"))
        .on("end", browsersync.reload);
}

function watching() {
    browsersync.init({
        server: "./dist/",
        notify: true
    });

    gulp.watch("./src/index.html", copyHtml);
    gulp.watch("./src/css/style.css", copyCss);
    gulp.watch("./src/assets/**/*.*", copyAssets);
    gulp.watch("./src/js/**/*.js", buildJs);
}

function buildProdJs() {
    return gulp.src("./src/js/main.js")
        .pipe(webpack({
            mode: 'production',
            output: {
                filename: 'main.js'
            },
            module: {
                rules: [
                    {
                        test: /\.m?js$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [['@babel/preset-env', {
                                    corejs: 3,
                                    useBuiltIns: "usage"
                                }]]
                            }
                        }
                    }
                ]
            }
        }))
        .pipe(gulp.dest(dist));
}

exports.buildJs = buildJs;
exports.copyHtml = copyHtml;
exports.copyCss = copyCss;
exports.copyAssets = copyAssets;
exports.watching = watching;
exports.buildProdJs = buildProdJs;

exports.build = parallel(copyCss, copyHtml, copyAssets, buildJs);
exports.default = parallel(watching, copyHtml, copyCss, copyAssets, buildJs);