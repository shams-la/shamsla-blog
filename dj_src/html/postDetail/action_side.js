// * making .actions-btns sticky

let sidebar = $('.action-btns'),
    offset = sidebar.offset().top - 95, //* -95 so it will not be snappy!
    win = $(window),
    remCls = () => sidebar.removeClass('stick-action'),
    addCls = () => sidebar.addClass('stick-action');

win.on('scroll', (e) => {
    if (win.width() > 767) {
        if (win.scrollTop() > offset) {
            remCls();
            addCls();
        } else {
            remCls();
        }
    } else {
        remCls();
    }
})