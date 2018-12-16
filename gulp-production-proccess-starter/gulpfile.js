const gulp = require('gulp');
const imgmin = require('gulp-imagemin');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const runSequence = require('run-sequence');
const concatCss = require('gulp-concat-css');
const browserSync = require('browser-sync').create();
const useref = require('gulp-useref');
const gulpIf = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');
const lazypipe = require('lazypipe');

gulp.task('logger', function() {
    console.log('logger: hello');
});

gulp.task('default', function(callback) {
    runSequence('watch', callback);
});

gulp.task('copyAllHTML', function() {
    console.log('copyAllHTML is running');
    gulp.src('src/*.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('minifyImages', () => {
    console.log('minifyImages is running');
    gulp.src('src/imgs/**/*')
    .pipe(imgmin())
    .pipe(gulp.dest('dist/imgs'));
});

gulp.task('processJS', function() {
    gulp.src('src/js/**/*')
    .pipe(uglify())
    //.pipe(concat('application.js'))
    .pipe(gulp.dest(('dist/js')))
});
// .pipe(browserSync.stream()) - insurers browser always running the current css when 
gulp.task('sass2CSS', function() {
    return gulp.src('src/sass/**/*.scss')
                .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
                .pipe(gulp.dest('src/css'))
                .pipe(browserSync.stream())
});

gulp.task('processCss', function() {
    return gulp.src('src/css/**/*.css')
                .pipe(concatCss('styles.css'))
                .pipe(gulp.dest('dist/css'))
                .pipe(browserSync.stream())
});

gulp.task('build', function(callback) {
    runSequence('sass2CSS', ['copyAllHTML', 'minifyImages', 'processJS', 'processCss'], callback);
});

// gulp.task('build', function(callback) {
//     return gulp.src('src/**/*.html')
//         .pipe(useref())
//         .pipe(gulp.dest('dist'))
// });
gulp.task('prodJS', function() {
    return gulp.src('src/**/*.html')
        .pipe(useref({}, lazypipe().pipe(sourcemaps.init, {loadMaps:true})))
        .pipe(sourcemaps.write('maps'))
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulp.dest('dist'))
});

gulp.task('prod-broken', function(callback) {
    runSequence('sass2CSS','processCSS', [ 'minifyImages', 'prodJS'], callback);
});
gulp.task('prod', function(callback) {
    runSequence('sass2CSS', [ 'minifyImages', 'prodJS'], callback);
});

// when browserSync finish than watch start
gulp.task('watch', ['browserSync'], function() {
    gulp.watch('src/**/*.html', ['copyAllHTML']);
    gulp.watch('src/js/**/*.js', ['processJS']);
    gulp.watch('src/imgs/**/*', ['minifyImages']);
    gulp.watch('src/sass/**/*.scss', ['sass2CSS']);
    gulp.watch('src/css/**/*.css', ['processCSS']);

    // reloaders - insurers browser reload when ever any file type is saved
    gulp.watch('src/**/*.html', browserSync.reload);
    gulp.watch('src/js/**/*.js', browserSync.reload);
    gulp.watch('src/imgs/**/*', browserSync.reload);
    gulp.watch('src/sass/**/*.scss', browserSync.reload);
    gulp.watch('src/css/**/*.css', browserSync.reload);    
});

gulp.task('browserSync', function() {
    browserSync.init({
        server: './dist',    // for production test
        // server: './src',  // for build test
        port: 8080,
        ui: { port:8081}
    })
});