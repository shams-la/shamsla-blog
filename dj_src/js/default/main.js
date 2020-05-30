function getCookie(name) {
  let nameEQ = name + '=';
  let ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

async function postRequest(url, data) {

  const defaults = {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify(data),
  };


  let response = await fetch(url, defaults);
  let res_data = await response.json();
  return res_data;
}

function removeAdd(tag, html) {
  // * To remove the the children of an element and add html
  // * More Simply Replace the innerHTML
  // * More specifically for loader/spinner
  tag.empty();
  if (html !== 'spin') {
    tag.append(html);
  } else {
    tag.append(g$spin_code)
  }
}

function disableBtn(btn, bool) {

  // * disable and enable button state
  // * More specific to prevent double click

  btn.prop('disabled', bool)
}