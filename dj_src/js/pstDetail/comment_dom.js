//* showing and hiding submit & cancel btns.

//* doing event delegation to also trigger dynamic element insertions.
$(document).on("keyup", 'textarea#comment-area', (e) => checkLogged(function () {
    targetDisplayBtns(...arguments)
}, e));
$('#comment-wrap').on('click', 'div.area-wrap button#comment-cancel', (e) => checkLogged(function () {
    targetCancel(...arguments)
}, e));

//* Handling the like, dislike, reply actions.
g$cmt_section.on('click', (e) => targetCommentsClick(e));

g$cmt_area.on('click', (e) => checkLogged(function () {
    targetMainComment(...arguments)
}, e));

//* handling the scroll event to load more comments on scroll to the bottom
$window.on('scroll', (e) => {
    console.log('object')
    if ($window.scrollTop() + $window.height() > $(document).height() - 200) {
        if (g$cmt_page_number && !g$cmt_req_pending) initComments()
    }
})

function checkLogged() {
    if (g$logged) {
        const [func, ...rest] = arguments;
        func(...rest);
    } else {
        //* Redirecting to the login page
        const {
            origin,
            pathname
        } = window.location;
        window.location.replace(origin + '/users/login/?next=' + pathname);
    }
}


function getCommentBoil(boil) {
    if (boil == "comment") {
        return `<div class="comment area-wrap" id="comment-$cid$" data-reply="$cid$" data-level="$level$"><img src="$img$" alt="$uname$" class="t-comment-img"><div class="comment-text-side"><p class="commenter"><a class="user-link" id="user-link" href="/users/profile/$uname$">$uname$</a><span class="comment-time text-muted">$time$</span></p><p class="comment-text">$comment$</p><div class="comment-actions flex"><button class="comment-action cmt-con" id="like-rep" data-like="$dl$"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="16px" height="16px"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" /></svg><span class="action-value text-muted">$nlike$</span></button><button class="cmt-con" id="dislike-rep" data-dislike="$ddl$"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="16px" height="16px"><path d="M0 0h24v24H0z" fill="none"/><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg></button><button class="cmt-con" id="reply"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="16px" height="16px"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/><path d="M0 0h24v24H0z" fill="none"/></svg></button></div></div></div>`;
    } else if (boil == "reply") {
        return `<div class="replies">$reps$</div>`;
    } else if (boil == "reps_btn") {
        return `<button class="btn btn-link flex view-more" id="view-btn" data-display="show"><img id="sort-con" src="/static/shamsla/images/down.svg" alt="view replies">View $rep_length$ replies</button>`;
    } else if (boil == "reply_input") {
        return `<div class="area-wrap active-reply" id="active-reply"> <img src="${g$user_avatar}" alt="${g$user_name}" class="user-img reply-img"> <textarea name="comment" id="comment-area" rows="1" class="comment-area reply-comment form-control" placeholder="Write Your Reply"></textarea> <div class="area-actions"> <button id="reply-ok" class="btn-sm btn btn-primary" disabled>Reply</button> <button id="comment-cancel" class="btn-sm btn btn-light">Cancel</button> </div></div>`;
    } else if (boil == 'more-reps') {
        return `<button class="btn btn-link flex" id="view-reps"><img src="/static/shamsla/images/more.svg" alt="view more"> View More</button>`
    }
}