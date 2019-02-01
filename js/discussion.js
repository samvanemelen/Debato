/* eslint-disable no-undef */
try {
  const cookieresult = document.cookie.split(';');
  // eslint-disable-next-line prefer-destructuring
  user = cookieresult[0].split('=')[1];
  // eslint-disable-next-line prefer-destructuring
  accessToken = cookieresult[1].split('=')[1];
// eslint-disable-next-line no-console
} catch (err) { console.log(err); }
updateLoginStatus();
/*
First permlink and author are retrieved from the URL
If not available, user is sent to index page
Then the code is similar to the writeDropDown function
but modified to fit the new page since there is no
button to drop down from
*/
URLvars = getUrlVars();
if (!('p' in URLvars) || !('a' in URLvars)) {
  window.location.href = '/';
}
const perm = URLvars.p;
const author = URLvars.a;
const discussionBody = document.getElementsByClassName('discussionBody')[0];
document.getElementById('discussion').id = perm;
discussionBody.style.maxHeight = 'none';
activePerm = perm;
activeAuthor = author;
readingPerm = perm;
readingAuthor = author;
let body = '';
steem.api.getContent(author, perm, (err, post) => {
  getPostArguments(author, perm).then((ArgDict) => {
    const info = getPostData(post);
    document.getElementsByClassName('thumbnail')[0].style.backgroundImage = `url(${info.thumbnail})`;
    body += `<div id = 'button-${readingPerm}' style='display: inline-block' ></div>`;
    body += `<h1 style='display: inline-block'>${info.title}</h1>`;
    body += `<p><strong>By: ${info.author}</strong> - ${info.reward}</p>`;
    body += `<p>${info.description}</p>`;
    body += writeCommentList(ArgDict.com);
    body += '<div class="argumentRow"><div class="pro argumentColumn"><center>PRO</center>';
    body += '</div><div class="con argumentColumn"><center>CON</center>';
    body += '</div></div>';
    discussionBody.innerHTML = body;
    if (user !== '' && user !== undefined) {
      let upvoteButtonBody = '';
      getVoteStatus(post).then((values) => {
        if (values.voteStatus) {
          upvoteButtonBody += `<div class='triangle' onclick="removeVote(this, '${readingAuthor}','${readingPerm}')"`;
          upvoteButtonBody += " style = \"border-bottom: 25px solid #3b9954\" onmouseover=\"this.style.borderBottom = '25px solid #ba5925';\" onmouseout=\"this.style.borderBottom='25px solid #3b9954';\"</div>";
        } else {
          upvoteButtonBody += `<div class='triangle' onclick="upvote(this, '${readingAuthor}','${readingPerm}')"></div>`;
        }
        document.getElementById(`button-${readingPerm}`).innerHTML = upvoteButtonBody;
      });
    }
    writeArgumentList(ArgDict.pro, 'pro');
    writeArgumentList(ArgDict.con, 'con');
  });
});
