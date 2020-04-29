const gulp = require('gulp');
const { execSync } = require('child_process');
const hash = require('gulp-hash');
const change = require('gulp-change');
const fs = require('fs');
const path = require('path');
const server = require('browser-sync');

const {html, css, js, proxy, watch} = require('./conf');


function reload(cb) {
    server.reload();
    cb();
}

// function pyreload(cb) {
//     setTimeout(() => server.reload(), 3000);
//     cb();
// }

function serve(cb) {
    server.init({
        // proxy: 'http://127.0.0.1:8000/'
        proxy: proxy

    })
    cb();
}

function changeHtml(content) {
    // let css_files = fs.readdirSync('./blog/shamsla/static/shamsla/css/');
    let css_files = fs.readdirSync(css.dest);
    css_files = css_files.filter(file => path.extname(file) === '.css');


    css_files.forEach(file => {

        const main_name = file.split('.')[0]

        // content = content.replace(new RegExp(`<link rel="stylesheet" href="{% static 'shamsla\\/css\\/${main_name}\\.*\\w*\\.css' %}">`), `<link rel="stylesheet" href="{% static 'shamsla/css/${file}' %}">`)
        content = content.replace(css.cssReg.before(main_name), css.cssReg.after(file))
    })

    return content
}




function changeHtmlJs(content) {
    // let js_files = fs.readdirSync('./blog/shamsla/static/shamsla/js/');
    let js_files = fs.readdirSync(js.dest);
    js_files = js_files.filter(file => path.extname(file) === '.js');

    console.log(js_files)

    js_files.forEach(file => {

        const main_name = file.split('.')[0]

        // content = content.replace(new RegExp(`<script src="{% static 'shamsla\\/js\\/${main_name}\\.*\\w*\\.js' %}"></script>`), `<script src="{% static 'shamsla/js/${file}' %}"></script>`)
        content = content.replace(js.jsReg.before(main_name), js.jsReg.after(file))
    })

    return content
}





gulp.task('hash_html', function(){
    // return gulp.src('./dj_src/html/**/*.html')
    // .pipe(change(changeHtml))
    // .pipe(gulp.dest('./blog/shamsla/templates/shamsla/'))
    return gulp.src(html.src+'/**/*.html')
    .pipe(change(changeHtml))
    .pipe(gulp.dest(html.dest))
})



gulp.task('hash_html_js', function() {
    // return gulp.src('./dj_src/html/**/*.html')
    // .pipe(change(changeHtmlJs))
    // .pipe(gulp.dest('./blog/shamsla/templates/shamsla/'))

    return gulp.src(html.src+'/**/*.html')
    .pipe(change(changeHtmlJs))
    .pipe(gulp.dest(html.dest))
})




gulp.task('script', () => {
    try {
        // execSync('rm ./blog/shamsla/static/shamsla/js/*.js');
        execSync('rm '+ js.dest +'/*.js');

    }
    catch {
        null;
    }
  return gulp
    // .src('./dj_src/js/*.js')
    .src(js.src + '/*.js')

    .pipe(hash({ template: '<%= name %>.<%= hash %><%= ext %>' }))

    // .pipe(gulp.dest('./blog/shamsla/static/shamsla/js/'))
    .pipe(gulp.dest(js.dest))

    .pipe(hash.manifest('hashed-assets.json'))

    // .pipe(gulp.dest('./dj_src/js/'));
    .pipe(gulp.dest(js.src));
})





gulp.task('style', function () {
    try {
        // execSync('rm ./blog/shamsla/static/shamsla/css/*.css');
        execSync('rm '+ css.dest +'/*.css');
    }
    catch {
        null;
    }
  return gulp
    // .src('./dj_src/css/*.css')
    .src(css.src + '/*.css')

    .pipe(hash({ template: '<%= name %>.<%= hash %><%= ext %>' }))

    // .pipe(gulp.dest('./blog/shamsla/static/shamsla/css/'))
    .pipe(gulp.dest(css.dest))

    .pipe(hash.manifest('hashed-assets.json'))

    // .pipe(gulp.dest('./dj_src/css/'));
    .pipe(gulp.dest(css.src));
});






gulp.task('watchf', function () {
//   gulp.watch('./dj_src/css/*.css', gulp.series('style', 'hash_html', reload));
  gulp.watch(css.src + '/*.css', gulp.series('style', 'hash_html', reload));

//   gulp.watch('./dj_src/html/**/*.html', gulp.series('hash_html', 'hash_html_js', reload));
  gulp.watch(html.src + '/**/*.html', gulp.series('hash_html', 'hash_html_js', reload));

//   gulp.watch('./dj_src/js/*.js', gulp.series('script', 'hash_html_js', reload));
  gulp.watch(js.src + '/*.js', gulp.series('script', 'hash_html_js', reload));

  watch.forEach(code => {
      code.watch(gulp, server);
  })

//   gulp.watch('./blog/**/*.py', gulp.series(pyreload));
});






module.exports.default = gulp.series('style', 'script', 'hash_html', 'hash_html_js',serve, 'watchf');



// function checkMapping(filepath, type) {

//     let mapping_type;

//     if ( type === 'css' ) mapping_type = mappings.css;
//     else if ( type === 'js' ) mapping_type = mappings.js;
//     else if ( type === 'html' ) mapping_type = mappings.html;

//     const src_file_name = path.basename(filepath).split('.')[0];
    
//     const result = mapping_type.filemaps.find(filemap => filemap.names.includes(src_file_name))

//     return result;
// }
