var g$cmt_actions = $("div#comment-actions");
// * Autosizing Functionality for the text area.
autosize(g$cmt_area);

$("button#comment-ok").on("click", async (e) => {
    let comment = g$cmt_area.val().trim();
    if (comment.length > 0) {
        const post_data = {
            body: comment,
            pid: g$post_id,
        };

        const response = await postRequest("/post/comment/", post_data);
        if (response.status == 200) {
            const obj = {
                name: g$user_name,
                img: g$user_avatar,
                id: response.id,
                cmt: comment,
                time: "0 seconds",
            };
            g$cmt_section.prepend(replaceBoil(obj, "parent"));
            hideMainActions();
        }
    }
});


async function targetPostReply(target) {

    //* getting the value of reply input
    const comment_text = target.parent().prev().val().trim();

    if (comment_text.length > 0) {
        //* Parent Comment to which the user will reply.
        const parent_comment = target.parent().parent().parent().parent();
        //* id of the comment to which reply the user is gonna reply. it will be sended with postRequest.
        const comment_id = parent_comment.attr("data-reply");

        const reply_data = {
            cid: comment_id,
            body: comment_text,
        };

        const response = await postRequest("/post/comment/reply/", reply_data);

        if (response.status == 200) {
            let obj = {
                name: g$user_name,
                img: g$user_avatar,
                id: response.id,
                cmt: comment_text,
                time: "0 seconds",
            };

            const getParentId = p => p.attr('id').split('-')[1];
            const incrementRepsNum = p => {
                const to_btn = p.find('button#view-btn');
                const btn_text = to_btn.html();
                const btn_num = Number(to_btn.text().match(/\d+/));
                to_btn.html(btn_text.replace(/\d+/, btn_num + 1));
            }

            if (parent_comment.attr("data-level") == "child") {
                //* checking is the user replying to a reply?. [see addCommentsToDom for +more]
                obj = [{
                    ...obj,
                    cmt: [
                        parent_comment
                        .children()
                        .first()
                        //* alt contains the username
                        .attr("alt"), obj.cmt
                    ]
                }];
                const child_reply_parent = parent_comment.parent().parent();
                addCommentReplies(obj, getParentId(child_reply_parent), true);

                //* incrementing the number of total replies like: View 10 replies -> View 11 replies
                incrementRepsNum(child_reply_parent);

            } else {
                //* if the user is replying to the parent_comment

                if (parent_comment.has('button#view-btn').length) {
                    //* if parent_comment has a button[#view-btn] for fetching and displaying the replies
                    const view_btn = parent_comment.find('button#view-btn');
                    console.log('has view-btn')
                    if (!parent_comment.find('.replies').children().length) {
                        //* if the replies haven't been loaded with by clicking the view-btn. then loading the reps
                        //* and here the addCommentReplies func is not getting called because now(at the time of executing these if statements) the reply has been posted and so thats why only loading the reps by executing the below statement.
                        view_btn.click();
                        console.log('loaded reps')
                    } else {
                        //* if the replies have already been loaded by the user so just add new reply to the dom.
                        addCommentReplies([obj], getParentId(parent_comment), true);

                        //* showing replies after adding the reply
                        showHideReplies(view_btn, 'show')
                    }


                } else {
                    //* if the parent_comment has 0 replies.
                    console.log('no view-btn')
                    addCommentReplies([obj], getParentId(parent_comment), false);

                    //* clicking the View 1 replies to solve a  simple problem of the view replies button text
                    showHideReplies(parent_comment.find('button#view-btn'), 'show');

                }

                //* incrementing the number of total replies like: View 10 replies -> View 11 replies
                incrementRepsNum(parent_comment);

            }
        }

        //* Removing the reply-input element.
        removePrevReply();
    }
}

function targetDisplayBtns(e) {
    const text_area = $(e.target);
    //* getting the submit-btn(comment/reply button)
    const submit_btn = text_area.next().children().first();

    //* changing the state of the button according to the text.length
    if (text_area.val().trim().length < 1) submit_btn.attr("disabled", 'true');

    else submit_btn.removeAttr("disabled");
}

function targetCancel(e) {
    const cancel_target = $(e.target);
    const cancel_parent = cancel_target.parent();
    if (cancel_parent.attr('id') == 'comment-actions') {
        // * targeting the main comment area.
        text_area = cancel_parent.prev()
        text_area.val('')

        //* disabling the submit-btn(comment-btn)
        submit_btn = cancel_target.prev();
        if (submit_btn.attr('disabled') != 'disabled') submit_btn.attr('disabled', 'true');

        //* finally disabling only the comment-actions block.
        cancel_parent.css('display', 'none')
    } else {
        //* if cancel-btn is inside the reply textarea so the textarea with its parent must be deleted.
        cancel_parent.parent().remove()
    }
}

function targetMainComment(e) {
    //* Un-hiding the submit&cancel btns (.main_actions)
    g$cmt_actions.css('display', 'block')

    //* this is just to close the previous active input-reply before targeting main textarea.
    removePrevReply()
}


function targetRenderReply(target) {

    //* hiding actions-btns(.area-actions) of the main_textarea(or comment input) before inserting the reply-input html
    hideMainActions();
    //* this is just to close the previous active input-reply before targeting the other one.
    removePrevReply()

    const reply_parent = target.parent().parent();

    const reply_input_boil = getCommentBoil('reply_input');
    reply_parent.append(reply_input_boil); //* appending the reply-input to the dom.

    autosize($('#active-reply #comment-area'));
}

function hideMainActions() {
    $('button.main_cancel').click()
}

function removePrevReply() {
    $('div#active-reply').remove();
}