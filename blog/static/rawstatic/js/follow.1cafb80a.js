async function targetFollowing(t,o=[],a=[],e=!1){const l=$(t.target),s=l.attr("data-type");e=e?"+":"",disableBtn(l,!0);const n={uid:l.attr("data-uid"),type:s};removeAdd(l,"spin");const r=await postRequest("/users/following/",n);return removeAdd(l,s),200==r.status&&("follow"==s?(l.text("Unfollow"),l.attr("data-type","unfollow"),a.forEach(t=>{l.css(t[0],t[1])})):"unfollow"==s&&(l.text(e+"Follow"),l.attr("data-type","follow"),o.forEach(t=>{l.css(t[0],t[1])}))),disableBtn(l,!1),s}