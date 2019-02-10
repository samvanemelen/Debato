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
  window.location.href = '/'; // If there are no variables parsed in URL, go to index
}
function getRootImage(post) {
/*
Loading a subdiscussion will only change the "discussionbody" element.
When a subdiscussion is loaded directly from the URL, information such as
the thumbnail image are not loaded again.
This function goes up the 'parent tree' to find the greatest grand parent
and use the image attribute from the original discussion.

1.  check if this post has an 'image' attribute in the JSON
2.  if no error, resolve the found 'image'
3.  if error, get parent comment and repeat the process.
*/
  return new Promise(((resolve, reject) => {
    let image;
    try {
      const parsedJSON = JSON.parse(post.json_metadata);
      // eslint-disable-next-line prefer-destructuring
      image = parsedJSON.image[0];
      resolve(image);
    } catch (error) {
      steem.api.getContent(post.parent_author, post.parent_permlink, (err, parentpost) => {
        if (parentpost.author === '') { reject(); }
        getRootImage(parentpost).then((parentimage) => { resolve(parentimage); });
      });
    }
  }));
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
    const metaList = document.getElementsByTagName('meta');
    metaList[0].setAttribute('content', info.description);
    document.title = `Debato - ${info.title}`;
    document.getElementsByClassName('thumbnail')[0].style.backgroundImage = `url(${info.thumbnail})`;
    body += `<div id = 'button-${readingPerm}' style='display: inline-block' ></div>`;
    body += `<h1 style ="display: inline-block">${info.title}</h1>`;
    if (info.author === user) {
      body += `<a class = "editlink" href='http://localhost/html/create?p=${readingPerm}'>edit</a>`;
    }
    checkForParent(info.author, info.perm).then((parentinfo) => {
      if (parentinfo[0]) {
        const buttonPlaceholder = document.getElementById('buttonPlaceholder');
        buttonPlaceholder.innerHTML = `<button class="backButton" onclick="writeDropDown('${parentinfo[1]}','${parentinfo[2]}')">back</button>`;
      }
    });
    body += '<div id = "buttonPlaceholder"></div>';
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
    getRootImage(post).then((rootimage) => { document.getElementsByClassName('thumbnail')[0].style.backgroundImage = `url(${rootimage})`; });
    writeArgumentList(ArgDict.pro, 'pro');
    writeArgumentList(ArgDict.con, 'con');
  });
});
