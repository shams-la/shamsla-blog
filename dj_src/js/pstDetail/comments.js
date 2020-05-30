function targetCommentsClick(e) {
  const target = $(e.target);
  if (target.attr("id") == "view-btn") viewNReplies(target);
  else if (target.attr("id") == "reply") checkLogged(function () {
    targetRenderReply(...arguments)
  }, target);
  else if (target.attr("id") == "reply-ok") checkLogged(function () {
    targetPostReply(...arguments)
  }, target);
  else if (target.attr("id") == "view-reps") insertMoreReps(target.parent().parent());
  else if (target.attr("id") == "like-rep") checkLogged(function () {
    likeComment(...arguments)
  }, target, 'like');
  else if (target.attr("id") == "dislike-rep") checkLogged(function () {
    likeComment(...arguments)
  }, target, 'dislike');
}

async function initComments() {
  //* fetching comments for first page_load.
  if (g$cmt_page_number) {
    //* setting g$cmt_req_pending to true to prevent multiple requests on scroll
    g$cmt_req_pending = true;

    //* hiding/un-hiding the litter scroll/loader
    const cmt_scroll = $('div#comment-scroll');
    cmt_scroll.css('display', 'flex');

    const fetched_cmts = await fetchComments();
    if (fetched_cmts !== null) {
      addCommentsToDom(fetched_cmts.cmts);
      if (fetched_cmts.hnext) g$cmt_page_number++;
      else g$cmt_page_number = null;
      g$cmt_req_pending = false;
    }
    cmt_scroll.css('display', 'none');
  }
}

async function fetchComments() {
  //* In this functions the comments will be paginated(fetched) according to the pagination_number[g$cmt_page_number] -- after every pagination it will be incremented by 1 for next page(or more comments).
  const cmt_data = {
    page: g$cmt_page_number,
    pid: g$post_id,
  };

  const res = await postRequest("/post/comment/get/", cmt_data);

  if (res.status == 200) {
    console.log("done");
    return res;
  }
  return null;
}

function addCommentsToDom(cmts) {
  const show_reps_btn = getCommentBoil("reps_btn");
  const replies_boil = getCommentBoil("reply");
  const c_container = document.createDocumentFragment();
  cmts.forEach((cmt) => {
    //* here 'child' is a data-level prop which will be used to add new comment or reply according to it.
    //* if the user is replying to a reply(or data-level=child) so it means, this new reply is gonna live inside the comment(or gonna being sibling of other replies of the parent comment).
    //*and if data-level=parent so it means its top level comment not a reply.

    let c_boil = replaceBoil(cmt, "parent");

    const cmt_replies_len = cmt.reps_len;
    if (cmt_replies_len > 0) c_boil = c_boil.slice(0, -6) + show_reps_btn.replace("$rep_length$", cmt_replies_len) + replies_boil.replace('$reps$', '') + '</div>';

    let c_span = document.createElement('span');
    c_span.innerHTML = c_boil;

    //* adding data-page attr for pagination
    if (cmt_replies_len > 0) $(c_span).children().first().attr('data-page', 1);

    c_container.appendChild(c_span);
  });
  g$cmt_section.append(c_container);
}

function replaceBoil(obj, level) {
  //* Basic function to replace the uname->username, img->user-image etc.
  let cmt_boil = getCommentBoil("comment");
  const replacements = [
    /\$uname\$/g,
    /\$img\$/,
    /\$comment\$/,
    /\$time\$/,
    /\$cid\$/g,
    /\$level\$/,
    /\$dl\$/,
    /\$ddl\$/,
    /\$nlike\$/
  ];

  const has_like = obj.hasOwnProperty('like') ? obj.like : 1;

  const replace_list = [
    obj.name,
    obj.img,
    obj.cmt.replace(/\n/g, "<br>"),
    obj.time + " ago",
    obj.id,
    level,
    has_like == "11" ? 0 : 1,
    has_like == "01" ? 0 : 1,
    Number(obj.nlike) > 0 ? obj.nlike : ''
  ];

  replace_list.forEach((rep, i) => {
    cmt_boil = cmt_boil.replace(replacements[i], rep);
  });

  return cmt_boil;
}