var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var del = require('del');

gulp.task('clean', function() {
     return del(['./dist']);
});

gulp.task('script', function() {
    gulp.src('./src/dowels.js')
        .pipe(uglify())
        .pipe(rename('dowels.min.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['clean'], function() {
    gulp.start('script');
});
