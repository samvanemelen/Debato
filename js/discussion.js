/* global writeDiscussionContent parseHtml getVoteStatus
showError showSuccess createCommentCard:true */

/*
First permlink and author are retrieved from the URL
If not available, user is sent to index page
Then the code is similar to the writeDiscussionContent function
but modified to fit the new page since there is no
button to drop down from
*/
if (!('p' in URLvars) || !('a' in URLvars)) {
  window.location.href = '/'; // If there are no variables parsed in URL, go to index
}
const perm = URLvars.p;
const author = URLvars.a;
const fade = document.getElementById('ContentFade');
const activeReplies = {};
writeDiscussionContent(author, perm);

// eslint-disable-next-line no-unused-vars
function edit(permlink) {
  /*
  This function edits an existing comment.
  The structure is similar to the comment function with the exception
  that the permlink already exists.
  */
  const editBox = document.getElementById('editBox');
  const inputList = document.getElementsByTagName('form')[0].getElementsByTagName('input');
  const body = fade.getElementsByTagName('textarea')[0].value;
  let type;
  for (let i = 0; i < inputList.length; i += 1) {
    if (inputList[i].checked) {
      type = inputList[i].value;
    }
  }
  if (document.getElementById('commentStructureBox').style.display !== 'block') { fade.style.display = 'none'; }
  editBox.style.display = 'none';
  steem.api.getContent(user, permlink, (err, post) => {
    api.comment(post.parent_author, post.parent_permlink, user, permlink, '', body, JSON.parse(`{"type":"${type}"}`), (error, res) => {
      if (res) {
        showSuccess('Successfully edited the post!');
        let statement;
        if (document.getElementById(`do-${permlink}`)) {
          // eslint-disable-next-line prefer-destructuring
          statement = document.getElementById(`do-${permlink}`).getElementsByClassName('commentContext')[0];
        } else if (document.getElementById(`de-${permlink}`)) {
          if (document.getElementById(`de-${permlink}`).getElementsByClassName('commentLink')[0]) {
            // eslint-disable-next-line prefer-destructuring
            statement = document.getElementById(`de-${permlink}`).getElementsByTagName('div')[0];
          } else {
            // eslint-disable-next-line prefer-destructuring
            statement = document.getElementById(`de-${permlink}`).getElementsByTagName('div')[0];
          }
          // eslint-disable-next-line prefer-destructuring
          statement = document.getElementById(`de-${permlink}`).getElementsByClassName('commentLink')[0];
        }
        statement.innerHTML = parseHtml(body);
      } else {
        showError(`Something went wrong while editing. Message: ${err}`);
      }
    });
  });
}
// eslint-disable-next-line no-unused-vars
function editComment(permlink, body, type) {
  const editBox = document.getElementById('editBox');
  const textarea = editBox.getElementsByTagName('textarea')[0];
  fade.style.display = 'block';
  editBox.style.display = 'block';
  textarea.value = body;
  const inputList = document.getElementsByTagName('form')[0].getElementsByTagName('input');
  for (let i = 0; i < inputList.length; i += 1) {
    if (inputList[i].value === type) {
      inputList[i].checked = true;
    }
  }
  fade.getElementsByClassName('postButton')[0].setAttribute('onclick', `edit("${permlink}")`);
}
// eslint-disable-next-line no-unused-vars
function openComment(commentAuthor, commentPermlink) {
  fade.style.display = 'block';
  document.getElementById('commentStructureBox').style.display = 'block';
  document.getElementById('commentStructureBox').innerHTML = '<i class="spinner fas fa-spinner"></i>';
  function sortRepliesDepth(replyList) {
    const sortedList = replyList.sort((a, b) => {
      if (a.commentItem.depth > b.commentItem.depth) {
        return 1;
      } if (a.commentItem.depth === b.commentItem.depth) {
        // If depths are equal, older replies should be shown first
        const da = new Date(a.commentItem.created);
        const db = new Date(b.commentItem.created);
        if (da > db) {
          return 1;
        }
      } return -1;
    });
    return sortedList;
  }
  steem.api.getState(`/debato/@${commentAuthor}/${commentPermlink}`, (err, result) => {
    const PromiseList = [];
    const replies = Object.values(result.content);
    for (let i = 0; i < replies.length; i += 1) {
      PromiseList.push(getVoteStatus(replies[i]));
    }
    Promise.all(PromiseList).then((unsortedArguments) => {
      document.getElementById('commentStructureBox').innerHTML = '';
      const values = sortRepliesDepth(unsortedArguments);
      const baseDepth = values[0].commentItem.depth;
      for (let i = 0; i < values.length; i += 1) {
        activeReplies[`do-${values[i].commentItem.parent_permlink}`] = values[i].commentitem;
        const depth = values[i].commentItem.depth - baseDepth;
        let replyParentBox;
        if (depth) {
          // eslint-disable-next-line prefer-destructuring
          replyParentBox = document.getElementById(`do-${values[i].commentItem.parent_permlink}`).getElementsByClassName('repliesPlaceholder')[0];
        } else {
          replyParentBox = document.getElementById('commentStructureBox');
        }
        let newContent = replyParentBox.innerHTML;
        values[i].mainComment = false;
        newContent += createCommentCard(values[i]);
        replyParentBox.innerHTML = newContent;
      }
    });
  });

  document.getElementById('commentStructureBox').style.display = 'block';
}
// eslint-disable-next-line no-unused-vars
function showReplyBox(obj, show) {
  const parentBox = obj.parentElement.parentElement.parentElement.parentElement;
  if (show) {
    parentBox.getElementsByClassName('replyBox')[0].style.display = 'block';
  } else {
    parentBox.getElementsByClassName('replyBox')[0].style.display = 'none';
  }
  obj.setAttribute('onClick', `showReplyBox(this, ${!show})`);
}
fade.addEventListener('click', (event) => {
  if (event.target === fade) {
    fade.style.display = 'none';
    document.getElementById('commentStructureBox').style.display = 'none';
    document.getElementById('commentStructureBox').innerHTML = '';
    document.getElementById('editBox').style.display = 'none';
  }
});
