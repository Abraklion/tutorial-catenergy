
const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const csso = require("gulp-csso");
const gulpIf = require("gulp-if");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webP = require("gulp-webp");
const svgStore = require("gulp-svgstore");
const cheerio = require("gulp-cheerio");
const replace = require("gulp-replace");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const del = require("del");

// Пути
const config = {
  switch: {
    fullCss: false, // true / false
    resizeImg: false, // true / false
  },
  paths: {
    html: 'source/*.html',
    sass: 'source/sass/style.scss',
    js: 'source/js/*.js',
    img: 'source/img/',
    webp: 'source/img/webp/',
    svg: 'source/img/sprite/**/*.svg',
    fonts: 'source/fonts/**/*.{woff,woff2}',
    ico: 'source/*.ico',
  },
  output: {
    path: 'build',
    pathCss: 'build/css',
    pathImg: 'build/img',
  },
  watch: {
    html: 'source/*.html',
    css: 'source/sass/**/*.scss',
  }
}

// Перетавкиваем Html в Build
const html = () => {
  return gulp.src(config.paths.html)
    .pipe(plumber())
    .pipe(gulp.dest(config.output.path))
    .pipe(sync.stream());
}

exports.html = html;

// Преобразует Scss в Css
const styles = () => {
  return gulp.src(config.paths.sass)
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(gulpIf(config.switch.fullCss,gulp.dest(config.output)))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest(config.output.pathCss))
    .pipe(sync.stream());
}

exports.styles = styles;

// Минифицируем изображения
const images = () => {
  return gulp.src([config.paths.img + '*.{jpg,png,svg}', config.paths.webp + '*.{jpg,png}'])
    .pipe(gulpIf(config.switch.resizeImg,imagemin([
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: true},
          {cleanupIDs: false}
        ]
      })
    ])))
    .pipe(gulp.dest(config.output.pathImg));
}

exports.images = images;

// Привращаем изображения в вебр webp
const webp = () => {
  return gulp.src(config.paths.webp + '**/*.{jpg,png}')
    .pipe(webP({quality: 90}))
    .pipe(gulp.dest(config.output.pathImg));
}

exports.webp = webp;

// Создает SVG спрайт
const sprite = () => {
  return gulp.src(config.paths.svg)
    .pipe(imagemin([
      imagemin.svgo({
        plugins: [
          {removeViewBox: false}
        ]
      })
    ]))
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: {xmlMode: true}
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(svgStore())
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest(config.output.pathImg));
}

exports.sprite = sprite;

// Запускает локальный сервер
const server = (done) => {
  sync.init({
    server: {
      baseDir: config.output.path
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Устанавливаем слежку за файлами
const watcher = () => {
  gulp.watch(config.watch.html, gulp.series("html"));
  gulp.watch(config.watch.css, gulp.series("styles"));
}

exports.watcher = watcher;

// Копируем файлы
const copy = () => {
  return gulp.src([
      config.paths.html,
      config.paths.fonts,
      config.paths.js,
      config.paths.ico,
    ], {
      base: "source"
    })
    .pipe(gulp.dest(config.output.path));
}

exports.copy = copy;

// Удаляем папку build
const clean = () => {
  return del(config.output.path)
}

exports.clean = clean;

// Такс по умолчанию
exports.default = gulp.series(clean,copy,images,webp,sprite,styles,html,server,watcher);





