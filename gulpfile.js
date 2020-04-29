const gulp = require('gulp');
const { execSync } = require('child_process');
const hash = require('gulp-hash');
const tap = require('gulp-tap');
const change = require('gulp-change');
const fs = require('fs');
const path = require('path');
const server = require('browser-sync');

const {html, css, js, proxy, watch, mappings} = require('./conf');


function reload(cb) {
    server.reload();
    cb();
}


function serve(cb) {
    server.init({
        proxy: proxy

    })
    cb();
}


function changeHtml(content) {

    // changing css hash
    
    const replaceHtml = (text, dir) => {
        
        let files = fs.readdirSync(dir);

        files = files.filter(file => path.extname(file) === '.css');

        files.forEach(file => {

            const main_name = file.split('.')[0]
            

            css.cssRegs.forEach(css_reg => {
                text = text.replace(css_reg.before(main_name), css_reg.after(file))
            })


        })

        return text

    }
    
    content = replaceHtml(content, css.dest);

    if (mappings.run && mappings.css.run) {
        mappings.css.filemaps.forEach(filemap => {
            content = replaceHtml(content, filemap.path)
        })
    }



    // changing js hash
    
    let js_files = fs.readdirSync(js.dest);
    js_files = js_files.filter(file => path.extname(file) === '.js');    

    js_files.forEach(file => {

        const main_name = file.split('.')[0]

        content = content.replace(js.jsReg.before(main_name), js.jsReg.after(file))
    })

    return content
}


function checkMapping(file, t, type) {

    let file_type;

    if ( type === 'css' ) file_type = {type: css, map_type: mappings.css};
    else if ( type === 'js' ) file_type = {type: js, map_type: mappings.js};
    else if ( type === 'html' ) file_type = {type: html, map_type: mappings.html};
    
    if (mappings.run && mappings.html.run) {

        const src_file_name = path.basename(file.path).split('.')[0];
    
        const map_path = file_type.map_type.filemaps.find(filemap => filemap.names.includes(src_file_name))    

        if (map_path === undefined) return t.through(gulp.dest, [file_type.type.dest]);

        else return t.through(gulp.dest, [map_path.path])
    }

    else return t.through(gulp.dest, [file_type.type.dest])
}


gulp.task('hash_html', function(){

    return gulp.src(html.src+'/**/*.html')
    .pipe(change(changeHtml))
    .pipe(tap((file, t) => checkMapping(file, t, 'html')))
})


gulp.task('script', () => {
    try {
        execSync('rm '+ js.dest +'/*.js');
        if (mappings.run && mappings.js.run) {
            mappings.js.filemaps.forEach(filemap => execSync(`rm ${filemap.path}/*.js`))
        }
    }
    catch {
        null;
    }
  return gulp.src(js.src + '/*.js')

    .pipe(hash({ template: '<%= name %>.<%= hash %><%= ext %>' }))

    .pipe(tap((file, t) => checkMapping(file, t, 'js')))

    .pipe(hash.manifest('hashed-assets.json'))

    .pipe(gulp.dest(js.src));
})


gulp.task('style', function () {
    try {
        execSync('rm '+ css.dest +'/*.css');
        if (mappings.run && mappings.css.run) {
            mappings.css.filemaps.forEach(filemap => execSync(`rm ${filemap.path}/*.css`))
        }
    }
    catch {
        null;
    }
  return gulp.src(css.src + '/*.css')

    .pipe(hash({ template: '<%= name %>.<%= hash %><%= ext %>' }))

    .pipe(tap((file, t) => checkMapping(file, t, 'css')))

    .pipe(hash.manifest('hashed-assets.json'))

    .pipe(gulp.dest(css.src));
});


gulp.task('watchf', function () {

  gulp.watch(css.src + '/*.css', gulp.series('style', 'hash_html', reload));

  gulp.watch(html.src + '/**/*.html', gulp.series('hash_html', reload));

  gulp.watch(js.src + '/*.js', gulp.series('script', 'hash_html', reload));

  watch.forEach(code => {
      code.watch(gulp, reload);
  })

});




module.exports.default = gulp.series('style', 'script', 'hash_html', serve, 'watchf');
