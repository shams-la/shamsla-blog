//

async function targetAction(btn_class) {

    // * btn_class | e.g. .like, .book to access their child and the btn(s) itself.

    const data = {
        'pid': '{{post.id}}'
    }

    const btn = $(`.action-btns .${btn_class}`);
    const btn_i_cls = btn.children().first().attr('class'); //* getting the classes of <i> to add later

    // * removing the <i> and adding the loader
    removeAdd(btn, `{% include 'shamsla/layout/sm_loader.html' %}`);

    const response = await postRequest('/post/like/', data);

    // * after the response removing the loader and adding the <i>
    removeAdd(btn, `<i class="${btn_i_cls}"></i>`)

    if (response.status == 200) {
        // * accord. to the response like/dis-like
        const btn_icon = $('.action-btns .like i');
        if (btn_icon.attr('class').includes('far')) btn_icon.removeClass('far').addClass('fas text-primary');
        else btn_icon.removeClass('fas text-primary').addClass('far')
    }
}

$('.action-btns .like').on('click', (e) => targetAction('like'));
// $('.action-btns .like').on('click', (e) => targetAction('like'));