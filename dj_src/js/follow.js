// Do not remove this comment [!required]

async function targetFollowing(e, style_follow = [], style_unfollow = [], plus = false) {
  // * adding follow and un-follow functionality
  // * style_[follow,unfollow] for applying custom styles to button
  // * plus=true to add plus(+) before follow text like => [ <>+Follow</> ]

  const btn = $(e.target);
  const btn_text = btn.attr("data-type");
  plus = plus ? '+' : ''; // * checking for plus=true to add [+]Follow
  // * disabling btn to prevent double click
  disableBtn(btn, true);

  const data = {
    uid: btn.attr("data-uid"),
    type: btn_text,
  };

  // * Removing the text [follow/unfollow] and adding the loader
  removeAdd(btn, 'spin');

  const response = await postRequest("/users/following/", data);

  // * Removing the loader and adding the text [follow/unfollow] back
  removeAdd(btn, btn_text);

  if (response.status == 200) {
    if (btn_text == "follow") {
      btn.text("Unfollow");
      btn.attr("data-type", "unfollow");

      style_unfollow.forEach((style) => {
        btn.css(style[0], style[1]);
      });
    } else if (btn_text == "unfollow") {
      btn.text(plus + "Follow"); // * Read Above - About plus
      btn.attr("data-type", "follow");

      style_follow.forEach((style) => {
        btn.css(style[0], style[1]);
      });
    }
  }

  // * enabling button again after completion
  disableBtn(btn, false);

  return btn_text;
}