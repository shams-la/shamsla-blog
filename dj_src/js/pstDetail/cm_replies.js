function showHideReplies(target, value) {
    let style_data = {
        dot_replies: "block",
        opposite_val: ["View", "Hide"],
        data_val: "hide",
        sort_icon: ["down", "up"],
    };

    if (value == "hide") {
        style_data = {
            dot_replies: "none",
            opposite_val: ["Hide", "View"],
            data_val: "show",
            sort_icon: ["up", "down"],
        };
    }

    const sort_con = target.find('img#sort-con').attr('src');

    target
        .html(
            target
            .html()
            .replace(style_data.opposite_val[0], style_data.opposite_val[1])
            .replace(sort_con, sort_con.replace(style_data.sort_icon[0], style_data.sort_icon[1]))
        )
        .attr("data-display", style_data.data_val);
    target.parent().find(".replies").css("display", style_data.dot_replies);
}

async function insertMoreReps(reps_parent) {
    const parent_id = reps_parent.attr("id").split("-")[1];
    const cmt_reps_page = reps_parent.attr("data-page");

    const replies_div = reps_parent.find('div.replies');
    //* removing the previous view-more btn
    replies_div.find('button#view-reps').remove();

    //* adding scroll bar
    replies_div.append(g$spin_code);

    const res = await fetchNReplies(parent_id, cmt_reps_page);

    //* removing scrollbar
    replies_div.find('div.spinner-border').remove();

    if (res) {

        //* adding the replies to below the specific comment
        addCommentReplies(res.reps, parent_id, true);

        //* incrementing the page number for replies pagination
        let new_page = Number(cmt_reps_page) + 1;
        if (!res.hnext) new_page = "null";

        //* adding view more replies button
        else replies_div.append(getCommentBoil("more-reps"));

        reps_parent.attr("data-page", new_page);
    }
}

async function viewNReplies(target) {
    if (target.attr("data-display") == "show") {
        if (!target.parent().find(".replies").children().length) {
            //* getting the id of the btn(View N replies) parent to fetch the replies of that parent
            const target_parent = target.parent();
            insertMoreReps(target_parent);
        }
        showHideReplies(target, "show");
    } else {
        showHideReplies(target, "hide");
    }
}

async function fetchNReplies(cid, page_num) {
    //* cid: getting the id of the btn(View N replies) parent to fetch the replies of that parent

    const post_data = {
        cid: cid,
        pnum: page_num,
    };

    const response = await postRequest("/post/comment/reply/get/", post_data);

    if (response.status == 200) return response;
    return null;
}

function addCommentReplies(replies, cmt_id, btn_exists) {
    let replies_group = "";

    comment = $(`#comment-${cmt_id}`); //* comment where the replies are gonna store inside.

    replies.forEach((reply) => {
        if (typeof reply.cmt == "object")
            reply = {
                ...reply,
                cmt: `<a class="reply-link" href="/users/profile/${reply.cmt[0]}">@${reply.cmt[0]}</a> ${reply.cmt[1]}`,
            };

        //* here also adding the reply to a var so at the replies will be displayed.
        //* here 'child' is a data-level prop which will be used to add new comment or reply according to it.
        //* if the user is replying to a reply(or data-level=child) so it means, this new reply is gonna live inside the comment(or gonna being sibling of other replies of the parent comment).
        //*and if data-level=parent so it means its top level comment not a reply.
        replies_group += replaceBoil(reply, "child");
    });

    //* checking is the (View N replies) button and div.replies already exist or not!
    //* And Adding Replies To The Dom[in the Specified Comment]
    console.log(cmt_id);
    if (!btn_exists) {
        console.log("no btn");
        const reply_boil =
            getCommentBoil("reps_btn").replace("$rep_length$", 0) +
            getCommentBoil("reply");
        comment.append(reply_boil.replace("$reps$", replies_group));
    } else {
        const reply_boil = comment.find(".replies");
        reply_boil.append(replies_group);
    }
}

async function likeComment(target, like_type) {
    const cmt_id = target.parent().parent().parent().attr('data-reply'); //* 1.comment-action -> 2.comment-text-side -> 3.comment
    const attrFn = target.attr.bind(target);
    const data_action = attrFn(`data-${like_type}`); //* 1(true) | 0(false)

    const post_data = {
        cid: cmt_id,
        action: data_action,
        type: like_type == 'like' ? 1 : 0
    }

    target.children().css('display', 'none');
    target.append(g$spin_code);

    const res = await postRequest(`/post/comment/like/`, post_data);

    target.children().last().remove();
    target.children().css('display', 'inline-block');

    if (res.status == 200) {

        const new_action = data_action == '1' ? '0' : '1';
        attrFn(`data-${like_type}`, new_action);


        if (like_type == 'like') {
            const count_tag = target.children().last();
            let count_val = count_tag.text().trim();
            if (data_action == '1') {
                if (count_val.length == 0) count_val = 1;
                else count_val = Number(count_val) + 1;
            } else {
                count_val = Number(count_val) - 1;
                if (count_val == 0) count_val = '';
            }
            count_tag.text(count_val);
        }

        const [invert_like, like_sib] = like_type == 'like' ? ['dislike', target.next.bind(target)] : ['like', target.prev.bind(target)];
        if (like_sib().attr(`data-${invert_like}`) == '0') {
            if (invert_like == 'like') {
                count_tag = like_sib().children().last();
                count_val = count_tag.text().trim();
                count_val = Number(count_val) - 1;
                if (count_val == 0) count_val = '';
                count_tag.text(count_val)
            }
            like_sib().attr(`data-${invert_like}`, '1')
        }


    }
}