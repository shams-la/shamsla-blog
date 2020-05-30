const firstFilter = gfilter((file) => {
    if (g$concat_js !== false) {
        file = replaceSlash(file.path).split(concat.js.breakpoint)[1];
        if (g$concat_js.includes(file)) {
            console.log(file);
            return false;
        }
    }
    return true;
});

const secondFilter = (file, filenames) => {
    file = replaceSlash(file.path).split(concat.js.breakpoint)[1];
    if (filenames.includes(file)) return true;
    return false;
};