var gulp        = require('gulp');
var $           = require('gulp-load-plugins')();
var browserify  = require('browserify');
var transform   = require('vinyl-transform');
var merge       = require('merge-stream');
var runSequence = require('run-sequence');
var saveLicense = require('uglify-save-license');
var spritesmith = require('gulp.spritesmith');
var browserSync = require('browser-sync');
var proxy       = require('proxy-middleware');
var reload      = browserSync.reload;

var path = {
  assets: 'assets',
  public: 'public'
};

gulp.task('compass', function () {
  gulp.src(path.assets + '/css/*.scss')
    .pipe($.plumber())
    .pipe($.compass({
      css: path.public + '/css',
      sass: path.assets + '/css',
      image: path.assets + '/img'
    }))
    .pipe($.minifyCss())
    .pipe(gulp.dest(path.public + '/css'));
});

gulp.task('sprite', function () {
  var spriteData = gulp.src(path.assets + '/img/sprites/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: '_sprite-data.scss',
    imgPath: '../img/common/sprite.png',
    cssFormat: 'scss'
  }));
  return merge(
    spriteData.img.pipe(gulp.dest(path.public + '/img')),
    spriteData.css.pipe(gulp.dest(path.assets + '/css/production/var'))
  );
});

gulp.task('browserify', function() {
  return merge(
    gulp.src(path.assets + '/js/common.js')
      //.pipe($.plumber({errorHandler: $.notify.onError('<%= error.message %>')}))
      .pipe(transform(function(filename){
        return browserify(filename)
          .require('backbone', {expose: 'backbone'})
          .require('underscore', {expose: 'underscore'})
          .require('jquery', {expose: 'jquery'})
          .bundle();
        })),

    gulp.src([
      path.assets + '/js/*.js',
      '!' + path.assets + '/js/common.js'
    ])
      //.pipe($.plumber({errorHandler: $.notify.onError('<%= error.message %>')}))
      .pipe(transform(function(filename){
        return browserify(filename)
          .external('backbone')
          .external('underscore')
          .external('jquery')
          .bundle();
        }))
  )
  .pipe(gulp.dest(path.public + '/js'))
  .pipe(reload({stream:true}));
});

gulp.task('jshint', function() {
  return gulp.src(path.assets + '/js/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('uglify', function() {
  return gulp.src(path.public + '/js/*.js')
    .pipe($.uglify({
      preserveComments: saveLicense
    }))
    .pipe(gulp.dest(path.public + '/js'));
});

gulp.task('copy:dev', function() {
  return gulp.src([
      path.assets + '/**/*.!(scss|js|md)',
      '!' + path.assets + '/img/sprites/**'
    ])
    .pipe(gulp.dest(path.public));
});

gulp.task('clean:public', function() {
  return gulp.src(
    path.public, {read: false}
  )
  .pipe($.clean());
});

gulp.task('clean:mock', function() {
  return gulp.src(
    [
      path.public + '/html',
    ], {read: false}
  )
  .pipe($.clean());
});

gulp.task('watch', ['browser-sync'], function() {
  gulp.watch(path.assets + '/js/**/*.js', ['browserify']);
  gulp.watch(path.assets + '/css/**/*.scss', ['compass']);
  gulp.watch(path.assets + '/**/*.html', ['copy:dev']);
});

gulp.task('browser-sync', function() {
  var url = require('url');
  var proxyOptions = url.parse('http://localhost:8080/api');
  proxyOptions.route = '/api';

  browserSync({
    port: 4000,
    server: {
      baseDir: path.public,
      middleware: [proxy(proxyOptions)],
    },
    startPath:'/html/'
  });
});

gulp.task('build', function(callback) {
  runSequence(
    'clean:public',
    'sprite',
    ['copy:dev','compass', 'browserify'],
    callback
  );
});

gulp.task('serve', function() {
  runSequence(
    'build',
    'watch'
  );
});

gulp.task('optim', function() {
  runSequence(
    'build',
    'clean:mock',
    'uglify'
  );
});