/* global updateLoginStatus getUrlVars writeDiscussionContent parseHtml
showError showSuccess:true */

/*
First permlink and author are retrieved from the URL
If not available, user is sent to index page
Then the code is similar to the writeDiscussionContent function
but modified to fit the new page since there is no
button to drop down from
*/
updateLoginStatus();
const URLvars = getUrlVars();
if (!('p' in URLvars) || !('a' in URLvars)) {
  window.location.href = '/'; // If there are no variables parsed in URL, go to index
}
const perm = URLvars.p;
const author = URLvars.a;
writeDiscussionContent(author, perm);

// eslint-disable-next-line no-unused-vars
function edit(permlink) {
  /*
  This function edits an existing comment.
  The structure is similar to the comment function with the exception
  that the permlink already exists.
  */
  const fade = document.getElementById('editFade');
  const inputList = document.getElementsByTagName('form')[0].getElementsByTagName('input');
  const body = fade.getElementsByTagName('textarea')[0].value;
  let type;
  for (let i = 0; i < inputList.length; i += 1) {
    if (inputList[i].checked) {
      type = inputList[i].value;
    }
  }
  fade.style.display = 'none';
  api.comment(activePost.author, activePost.permlink, user, permlink, '', body, JSON.parse(`{"type":"${type}"}`), (err, res) => {
    if (res) {
      showSuccess('Successfully edited the post!');
      let statement;
      if (document.getElementById(`de-${permlink}`).getElementsByClassName('commentLink')[0]) {
        // eslint-disable-next-line prefer-destructuring
        statement = document.getElementById(`de-${permlink}`).getElementsByClassName('commentLink')[0];
      } else if (document.getElementById(`de-${permlink}`).getElementsByTagName('div')[0]) {
        // eslint-disable-next-line prefer-destructuring
        statement = document.getElementById(`de-${permlink}`).getElementsByTagName('div')[0];
      }
      statement.innerHTML = parseHtml(body);
    } else {
      showError('Something went wrong while editing. Try again or notify us when the error persists.');
    }
  });
}

// eslint-disable-next-line no-unused-vars
function editComment(permlink, body, type) {
  const fade = document.getElementById('editFade');
  const textarea = fade.getElementsByTagName('textarea')[0];
  fade.style.display = 'block';
  textarea.value = body;
  const inputList = document.getElementsByTagName('form')[0].getElementsByTagName('input');
  for (let i = 0; i < inputList.length; i += 1) {
    if (inputList[i].value === type) {
      inputList[i].checked = true;
    }
  }
  fade.getElementsByClassName('postButton')[0].setAttribute('onclick', `edit("${permlink}")`);
  fade.addEventListener('click', (event) => {
    if (event.target === fade) {
      fade.style.display = 'none';
    }
  });
}
