// * making .actions-btns sticky

(function actionSide() {
    const win_sidebar = $('.action-btns'),
        sidebar_offset = win_sidebar.offset().top - 95, //* -95 so it will not be snappy!
        remSideCls = () => win_sidebar.removeClass('stick-action'),
        addSideCls = () => win_sidebar.addClass('stick-action');
    $window.on('scroll', (e) => {
        if ($window.width() > 767) {
            if ($window.scrollTop() > sidebar_offset) {
                remSideCls();
                addSideCls();
            } else {
                remSideCls();
            }
        } else {
            remSideCls();
        }
    })
})();