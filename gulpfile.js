/*** 1. DEPENDENCIES *****************************************************/
var gulp = require('gulp'),                   // globel | gulp core
    concat = require('gulp-concat'),          // globel | concatinate files
    rename = require("gulp-rename"),          // globel | rename files
    notify = require('gulp-notify'),          // globel | send notifications to windows
    plumber = require('gulp-plumber'),        // globel | disable interuption
    browserSync = require('browser-sync'),    // globel | inject code to all devices
    reload = browserSync.reload,

    imagemin = require('gulp-imagemin'),

    stylus = require('gulp-stylus'),          // css | stylus compiler
    minifycss = require('gulp-minify-css'),   // css | minify the css files 
    uncss = require('gulp-uncss'),            // css | remove un wanted css

    jade = require('gulp-jade'),              // html | jade compiler
    
    coffee = require('gulp-coffee'),          // js | coffeefy js
    uglify = require('gulp-uglify'),          // js | minify js
    es = require('event-stream'),             // js | combine js
    del = require('del');

/*** 2. FILE DESTINATIONS ************************************************/
var path = {
    dev : {
        app     : 'src/**/*',
        stylus  : 'src/**/*.styl',
        jade    : ['src/**/*.jade', '!src/**/_*.jade'],
        images  : 'src/assets/app/images/**/*.png',
        coffee  : 'src/**/*.coffee',
        script  : 'src/**/*.js',
        vendor  : ['vendors/**/*', '!vendors/**/*.css']
    },
    build : {
        app     : './build/',
        from_app: './build/assets/app/',
        css     : './build/assets/app/',
        js      : './build/assets/app/',
        images  : './build/assets/app/images/',
        fonts   : './build/assets/app/fonts/',
        vendor  : './build/assets/vendors/'
    }
};

// Copy all static images
gulp.task('images', function() {
  return gulp.src(path.dev.images)
    // Pass in options to the task
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest(path.build.images));
});

/*** vendor ***/
gulp.task('vendor', function() {
    gulp.src(path.dev.vendor)
        .pipe(gulp.dest(path.build.vendor))               // where to put the file
});

/*** 3. JADE TASK ********************************************************/
gulp.task('jade', function() {
    gulp.src(path.dev.jade)
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(path.build.app))               // where to put the file
        .pipe(notify({message: 'jade processed!'}))  // notify when done
        .pipe(reload({stream:true}));
});

/*** 4. STYLUS TASK ******************************************************/
gulp.task('stylus', function() {
    gulp.src(path.dev.stylus)                         // get the files
        .pipe(plumber())                                // make sure gulp keeps running on errors
        .pipe(stylus({                                  // compile all stylus
            'include css': true,                        // @import css files in stylus files
          }))
        .pipe(concat('app.css')) 
        .pipe(uncss({
            html: ['build/**/*.html']
        }))
        .pipe(minifycss())                             // minify css
        .pipe(rename('app-min.css'))   
        .pipe(gulp.dest(path.build.css))               // where to put the file
        .pipe(notify({message: 'stylus processed!'}))  // notify when done
        .pipe(reload({stream:true}));
});

/*** 5. JS TASKS *********************************************************/
gulp.task('scripts', function() {
    var javaScriptFromCoffeeScript = gulp.src(path.dev.coffee)
        .pipe(coffee());

    var js =  gulp.src(path.dev.script)
 
    return es.merge(javaScriptFromCoffeeScript, js)     // streaming coffee to js
        .pipe(concat('app-min.js')) 
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(notify({ message: 'scripts processed!'}))     // notify when done
        .pipe(reload({stream:true}));
});

/*** 6. WATCH FILES ******************************************************/
gulp.task('watch', function(){
  gulp.watch(path.dev.stylus, ['stylus']);
  gulp.watch(path.dev.jade, ['jade']);
  gulp.watch(path.dev.script, ['scripts']);
  gulp.watch(path.dev.coffee, ['scripts']);
});

/*** 7. BROWSER SYNC ******************************************************/
gulp.task('serve', ['watch', 'vendor', 'images', 'jade', 'stylus', 'scripts'], function() {
    browserSync({
        server: "./build"
    });
});

/*** 8. GULP TASKS ********************************************************/
gulp.task('default', ['serve']);
