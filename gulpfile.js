const gulp = require("gulp");
const {
  execSync
} = require("child_process");
const hash = require("gulp-hash");
const tap = require("gulp-tap");
const change = require("gulp-change");
const path = require("path");
const server = require("browser-sync");
const glob = require("glob");
const gconcat = require('gulp-concat');
const terser = require('gulp-terser');
const {
  html,
  css,
  js,
  proxy,
  watch,
  mappings,
  concat
} = require("./conf");

//* to hold all the files that will be combined
let g$concat_js = [];

if (concat.run && concat.js.run) {

  concat.js.files.forEach((filename, i) => {
    const names = filename.filenames;
    const new_names = [];
    names.forEach((name) => {
      if (typeof name != "object") new_names.push(`${js.src}/${name}.js`);
      else {
        name = name.names.map(n => `${js.src}/${name.path}/${n}.js`);
        new_names.push(...name);
      }
    });
    concat.js.files[i].filenames = new_names;
  });

  g$concat_js = (() =>
    concat.js.files.reduce((all, one) => [...all, ...one.filenames], []))();
}


function reload(cb) {
  server.reload();
  cb();
}

function serve(cb) {
  server.init({
    proxy: proxy,
  });
  cb();
}

function changeHtml(content) {
  // changing css hash

  const replaceHtml = (text, dir, ext, ext_regex, path_breakpoint) => {
    //* path_breakpoint is just a separator b/w the file name and the path
    //* and the filename may contain a small path also e.g. fn=auto.hash.js but may be this fn=bar/foo/auto.hash.js should be replaced in the html
    //* .blog/static/rawstatic/js/bar/foo/auto.hash.js -- here /rawstatic/ | /js/ can be a breakpoint because it is separating the path and the filename.

    let files = glob.sync(dir + "/**/*" + ext);

    files.forEach((file) => {
      file = file.split(path_breakpoint)[1];
      const main_name = path.basename(file).split(".")[0];
      ext_regex.forEach((reg_ex) => {
        text = text.replace(reg_ex.before(main_name), reg_ex.after(file));
      });
    });

    return text;
  };

  content = replaceHtml(
    content,
    css.dest,
    ".css",
    css.cssRegs,
    "/rawstatic/css/"
  );

  if (mappings.run && mappings.css.run) {
    mappings.css.filemaps.forEach((filemap) => {
      content = replaceHtml(
        content,
        filemap.path,
        ".css",
        css.cssRegs,
        filemap.path + "/"
      );
    });
  }

  // changing js hash

  content = replaceHtml(content, js.dest, ".js", js.jsReg, "/rawstatic/js/");
  if (mappings.run && mappings.js.run) {
    mappings.js.filemaps.forEach((filemap) => {
      content = replaceHtml(
        content,
        filemap.path,
        ".js",
        js.jsReg,
        filemap.path + "/"
      );
    });
  }

  return content;
}

function checkMapping(file, t, type) {
  let file_type;

  if (type === "css")
    file_type = {
      type: css,
      map_type: mappings.css,
    };
  else if (type === "js")
    file_type = {
      type: js,
      map_type: mappings.js,
    };
  else if (type === "html")
    file_type = {
      type: html,
      map_type: mappings.html,
    };

  if (mappings.run && file_type.map_type.run) {
    const src_file_name = path.basename(file.path).split(".")[0];

    const map_path = file_type.map_type.filemaps.find((filemap) =>
      filemap.names.includes(src_file_name)
    );

    if (map_path === undefined)
      return t.through(gulp.dest, [file_type.type.dest]);
    else return t.through(gulp.dest, [map_path.path]);
  } else return t.through(gulp.dest, [file_type.type.dest]);
}

gulp.task("hash_html", function () {
  return gulp
    .src([html.src + "/**/*.html", html.src + "/**/*.js"]) //* .js to also get the js files inside html folder
    .pipe(change(changeHtml))
    .pipe(tap((file, t) => checkMapping(file, t, "html")));
});

gulp.task("script", () => {
  try {
    execSync("rm " + js.dest + "/*.js");
    if (mappings.run && mappings.js.run) {
      mappings.js.filemaps.forEach((filemap) =>
        execSync(`rm ${filemap.path}/*.js `));
    }
  } catch {
    null;
  }
  try {
    execSync("rm " + js.dest + "/**/*.js");
    if (mappings.run && mappings.js.run) {
      mappings.js.filemaps.forEach((filemap) =>
        execSync(`rm ${filemap.path}/**/*.js `));
    }
  } catch {
    null
  };

  if (g$concat_js.length) {
    concat.js.files.forEach(file => {
      gulp.src(file.filenames)
        .pipe(gconcat(file.path))
        .pipe(terser({
          keep_fnames: false,
          compress: {
            passes: 50,
            drop_console: true,
          },
          ecma: 2019
        }))
        .pipe(hash({
          template: "<%= name %>.<%= hash %><%= ext %>"
        }))
        .pipe(tap((file, t) => checkMapping(file, t, "js")))
    })
  }

  return gulp
    .src([js.src + "/**/*.js", ...g$concat_js.map(name => `!${name}`)])
    .pipe(terser({
      keep_fnames: false,
      compress: {
        passes: 50,
        drop_console: true,
      },
      ecma: 2019
    }))
    .pipe(
      hash({
        template: "<%= name %>.<%= hash %><%= ext %>",
      })
    )

    .pipe(tap((file, t) => checkMapping(file, t, "js")))

    .pipe(hash.manifest("hashed-assets.json"))
    .pipe(gulp.dest(js.src));
});

gulp.task("style", function () {
  try {
    execSync("rm " + css.dest + "/*.css");
    if (mappings.run && mappings.css.run) {
      mappings.css.filemaps.forEach((filemap) =>
        execSync(`rm ${filemap.path}/*.css `));
    }
  } catch {
    null;
  }
  try {
    execSync("rm " + css.dest + "/**/*.css");
    if (mappings.run && mappings.css.run) {
      mappings.css.filemaps.forEach((filemap) =>
        execSync(`rm ${filemap.path}/**/*.css `));
    }
  } catch {
    null;
  }
  return gulp
    .src(css.src + "/**/*.css")

    .pipe(
      hash({
        template: "<%= name %>.<%= hash %><%= ext %>",
      })
    )

    .pipe(tap((file, t) => checkMapping(file, t, "css")))

    .pipe(hash.manifest("hashed-assets.json"))
    .pipe(gulp.dest(css.src));
});

gulp.task("watchf", function () {
  gulp.watch(css.src + "/**/*.css", gulp.series("style", "hash_html", reload));

  gulp.watch(html.src + "/**/*", gulp.series("hash_html", reload));

  gulp.watch(js.src + "/**/*.js", gulp.series("script", "hash_html", reload));

  watch.forEach((code) => {
    code.watch(gulp, reload);
  });
});

module.exports.default = gulp.series(
  "style",
  "script",
  "hash_html",
  serve,
  "watchf"
);