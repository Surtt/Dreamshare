'use strict';

const gulp = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const minify = require('gulp-csso');
const rename = require('gulp-rename');
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require('del');
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const server = require('browser-sync').create();

gulp.task('pug', function() {
  return gulp.src('src/views/*.pug')
  .pipe(plumber())
  .pipe(pug({
    pretty: true
  }))
  .pipe(gulp.dest('build'));
});

gulp.task('style', function() {
  return gulp.src('src/styles/style.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(minify())
    .pipe(sourcemaps.write())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

gulp.task('images', function() {
  return gulp.src('src/img/**/*.{png,jpg,svg}')
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.jpegtran({progressive: true}),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest('build/img'));
});

gulp.task('webp', function() {
  return gulp.src('source/img/**/*.{png,jpg}')
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest('src/img'));
});

gulp.task('sprite', function() {
  return gulp.src('src/img/**/*.svg')
      .pipe(svgmin({
          js2svg: {
              pretty: true
          }
      }))
      .pipe(cheerio({
          run: function ($) {
              $('[fill]').removeAttr('fill');
              $('[stroke]').removeAttr('stroke');
              $('[style]').removeAttr('style');
          },
          parserOptions: {xmlMode: true}
      }))
      .pipe(replace('&gt;', '>'))
      .pipe(svgSprite({
          mode: {
              symbol: {
                  sprite: "sprite.svg"
              }
          }
      }))
      .pipe(gulp.dest('build/img/svg'));
});


// gulp.task('sprite', function() {
//   return gulp.src('src/img/**/*.svg')
//   .pipe(svgstore({
//     inlineSvg: true
//   }))
//   .pipe(rename('sprite.svg'))
//   .pipe(gulp.dest('build/img/svg'));
// });

gulp.task('serve', function() {
  server.init({
    server: 'build/'
  });

  gulp.watch('src/**/*.pug', gulp.series('pug'));
  gulp.watch('src/**/*.{scss,sass}', gulp.series('style'));
  gulp.watch('src/**/*.{png,jpg,svg}', gulp.series('images'));
  gulp.watch('build/*.html').on('change', server.reload);
});

gulp.task('copy', function() {
  return gulp.src([
    'src/fonts/**/*.{woff,woff2}',
    'src/img/**/*.{jpg,png}',
    'src/js/**'
  ], {
    base: 'src'
  })
  .pipe(gulp.dest('build'));
});

gulp.task('clean', function() {
  return del('build');
});

gulp.task('build', gulp.series(
  'clean',
  'copy',
  'style',
  'sprite',
  'pug'
));
