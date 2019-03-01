/* eslint-disable no-unused-vars */
user = ''; accessToken = ''; expiresIn = ''; weight = 10000;
const weightSlider = document.getElementById('voteSlider');
const converter = new showdown.Converter({ simplifiedAutoLink: true });
// eslint-disable-next-line func-names
weightSlider.oninput = function () {
  // When the weight slider changes, change the cookie and change the indicator
  weight = this.value;
  document.getElementById('voteIndicator').innerHTML = `${this.value / 100}% upvotes`;
  document.cookie = `weight=${weight}; path=/`;
};
function showError(message) {
  /*
  Custom alternative to "alert" function
  displays the errorbox element and add custom message
  after 7 seconds the box will automatically close
  */
  const errorbox = document.getElementById('errorbox');
  const errortext = errorbox.getElementsByClassName('boxcontent')[0];
  errortext.innerHTML = message;
  errorbox.style.display = 'initial';
  setTimeout(() => {
    if (errorbox.style.display !== 'none') { errorbox.style.display = 'none'; }
  }, 7000);
}
function showWarning(message) {
  /*
  Custom alternative to "alert" function
  displays the warningbox element and add custom message
  after 7 seconds the box will automatically close
  */
  const warningbox = document.getElementById('warningbox');
  const warningtext = warningbox.getElementsByClassName('boxcontent')[0];
  warningtext.innerHTML = message;
  warningbox.style.display = 'initial';
  setTimeout(() => {
    if (warningbox.style.display !== 'none') { warningbox.style.display = 'none'; }
  }, 7000);
}
function showSuccess(message) {
  /*
  Custom alternative to "alert" function
  displays the successbox element and add custom message
  after 7 seconds the box will automatically close
  */
  const successbox = document.getElementById('successbox');
  const successtext = successbox.getElementsByClassName('boxcontent')[0];
  successtext.innerHTML = message;
  successbox.style.display = 'initial';
  setTimeout(() => {
    if (successbox.style.display !== 'none') { successbox.style.display = 'none'; }
  }, 7000);
}
function toggleMenu(show = null) {
  /*
  When the user hovers over the Account element it checks if the user is logged in
  -> the user is not '' nor undefined
  if this is the case the max height is set to 200px, if the user leaves the element
  max height is set to 0
  For mobile versions the button can also be clicked to toggle the menu. In this case
  the variable 'show' is not given and remains null. Then it should toggle depending
  on the existing value of max-Height.
  */
  const accountMenu = document.getElementById('accountMenu');
  if (user !== '' && user !== undefined) {
    if (show === null) {
      if (accountMenu.style.maxHeight === '' || accountMenu.style.maxHeight === '0px') {
        accountMenu.style.maxHeight = '200px';
      } else { accountMenu.style.maxHeight = '0'; }
    } else if (show) { accountMenu.style.maxHeight = '200px'; } else if (!show) { accountMenu.style.maxHeight = '0'; }
  }
}
function updateLoginStatus() {
  /*
  When the user logs in via steemconnect, information is stored in a cookie
  to be used on other pages. When any other page loads, this function is called
  to read the cookies and get the account information (username, token, weight)
  If there is no data stored in the cookie (not logged in yet or expired)
  the link to SteemConnect is shown
  */
  try {
    const cookieresult = document.cookie.replace(/ /g, '');
    const cookielist = cookieresult.split(';');
    const cookieDict = {};
    for (let i = 0; i < cookielist.length; i += 1) {
      const pair = cookielist[i].split('=');
      const key = pair[0];
      const value = pair[1];
      cookieDict[key] = value;
    }
    if ('username' in cookieDict) { user = cookieDict.username; }
    // eslint-disable-next-line prefer-destructuring
    if ('accessToken' in cookieDict) { accessToken = cookieDict.accessToken; }
    if (weight in cookieDict) {
      weight = parseInt(cookieDict.weight, 10);
      weightSlider.value = weight;
      document.getElementById('voteIndicator').innerHTML = `${weightSlider.value / 100}% upvotes`;
    }
  } catch (error) { accessToken = ''; }
  if (accessToken !== '') {
    steem.api.getAccounts([user], (err, result) => {
      const name = user;
      let profileImage = JSON.parse(result[0].json_metadata).profile.profile_image;
      if (profileImage === undefined) { profileImage = ''; }
      const body = `<div id = "profileImage" style="background-image:url(${profileImage});"></div><p id = "accountUsername">${name}</p>`;
      document.getElementById('accountLogin').innerHTML = body;
      if (document.getElementById('feed')) { document.getElementById('feed').style.display = ''; }
      document.getElementById('profileLink').href = `/html/profile?u=${user}`;
      api = sc2.Initialize({
        app: 'debato-app',
        callbackURL: 'http://www.debato.org',
        accessToken,
        scope: ['vote', 'comment', 'delete_comment'],
      });
    });
  } else {
    const redirURL = window.location.href.split('/').slice(0, 3).join('/');
    const link = `<a id = "SteemConnect" class="blackLink" href = "https://steemconnect.com/oauth2/authorize?client_id=debato-app&redirect_uri=${redirURL}&scope=vote,comment,delete_comment">Log in</a>`;
    document.getElementById('accountLogin').innerHTML = link;
    document.getElementById('createAccount').style.display = 'block';
  }
}
function getUrlVars() {
  // Get the variables passed in the URL
  const vars = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
    vars[key] = value;
  });
  return vars;
}
function logout() {
  // Revokes the active token and return to the home page
  api.revokeToken((err, res) => {
    if (err) { showError(`Could not revoke token; ${err.toString()}`); return; }
    if (res) {
      showSuccess('Successfully revoked token');
      document.cookie = `username=${user};expires=expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;`;
      document.cookie = `accessToken=${accessToken};expires=expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;`;
      document.cookie = `weight=${weight};expires=expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;`;
      user = '';
      accessToken = '';
      expiresIn = '';
      window.location.href = '/index';
    }
  });
}
function timeSince(UTCstring) {
  /*
  Accepts a date in UTC format and returns the age relative to the present
  Will display age in years, months, days, hours, minutes or seconds depending
  on the age. (at least 2 of the longer time unit to switch to that unit)
  */
  const AgeSeconds = Math.floor((new Date() - new Date(UTCstring)) / 1000);
  let interval = Math.floor(AgeSeconds / 31536000);
  if (interval > 1) {
    return `${interval} years`;
  }
  interval = Math.floor(AgeSeconds / 2592000);
  if (interval > 1) {
    return `${interval} months`;
  }
  interval = Math.floor(AgeSeconds / 86400);
  if (interval > 1) {
    return `${interval} days`;
  }
  interval = Math.floor(AgeSeconds / 3600);
  if (interval > 1) {
    return `${interval} hours`;
  }
  interval = Math.floor(AgeSeconds / 60);
  if (interval > 1) {
    return `${interval} minutes`;
  }
  return `${Math.floor(AgeSeconds)} seconds`;
}
function parseHtml(string) {
  let parsedString = string.replace(/&/g, '&amp;');
  parsedString = parsedString.replace(/</g, '&lt;');
  parsedString = parsedString.replace(/>/g, '&gt;');
  parsedString = parsedString.replace(/"/g, '&quot;');
  /*
  If a username is detected
  ('@' followed by a letter, followed by any character, ending with a letter or number)
  it will replace it with a link to that user's profile page
  */
  parsedString = parsedString.replace(/@([a-zA-Z]+[a-zA-Z1-9-.]+[a-zA-Z1-9]+)/g, '<a href = "/html/profile?u=$1">@$1</a>');
  return parsedString;
}
function upvote(obj, author, perm) {
  // Upvote a post and change the settings of the upvote button
  obj.classList.add('rotate');
  api.vote(user, author, perm, weight, (err, res) => {
    if (res) {
      obj.setAttribute('onclick', `removeVote(this, '${author}', '${perm}')`);
      obj.classList.add('activated');
      const prevElement = obj.previousElementSibling;
      if (prevElement) { prevElement.innerHTML = parseInt(prevElement.innerHTML, 10) + 1; }
    } else {
      showError('Could not broadcast vote. Please refresh the page and try again');
    }
    obj.classList.remove('rotate');
  });
}
function removeVote(obj, author, perm) {
  /*
  Set an upvote value to 0
  change the settings of the button
  remove the element from the page
  */
  obj.classList.add('rotate');
  api.vote(user, author, perm, 0, (err, res) => {
    if (res) {
      obj.setAttribute('onclick', `upvote(this, '${author}', '${perm}')`);
      obj.classList.remove('activated');
      const prevElement = obj.previousElementSibling;
      if (prevElement) {
        if (parseInt(prevElement.innerHTML, 10) > 0) {
          prevElement.innerHTML = parseInt(prevElement.innerHTML, 10) - 1;
        }
      }
    } else {
      showError('Could not remove vote. Please refresh the page and try again');
    }
    obj.classList.remove('rotate');
  });
}
function commentsDropDown(obj) {
  /*
  Display the comment section of a certain discussion
  also expands the box when content size changes
  */
  let content;
  if (obj.className.indexOf('comments') !== -1) { content = obj.nextElementSibling; } else { content = obj.parentElement.parentElement; }
  /*
  If the button object has the class 'comments', The next element is the commentList
  If another button is passed (Add comment) it should just expand the existing div element
  And in that case, the commentList is the grandparent element
  */
  if ((content.style.maxHeight === (`${content.scrollHeight}px`) || content.style.maxHeight === '500px')) {
    content.style.maxHeight = null;
    content.style.borderStyle = 'none';
  } else if (content.scrollHeight > 500) { content.style.maxHeight = '500px'; content.style.overflow = 'scroll'; } else { content.style.maxHeight = `${content.scrollHeight}px`; }
}
function showCommentBox(buttonObj) {
  // Displays the text area for typing a new comment
  const commentobj = buttonObj.parentElement.parentElement;
  const textbox = buttonObj.nextElementSibling;
  if (textbox.style.display === 'none' || textbox.style.display === '') {
    textbox.style.display = 'block';
    if (commentobj.style.overflow !== ('scroll')) { commentobj.style.maxHeight = 'none'; }
  } else { textbox.style.display = 'none'; }
  if (commentobj.style.maxHeight !== '500px' && buttonObj.parentElement.className !== 'statementBox') {
    commentsDropDown(buttonObj);
  }
}
function comment(textbox, commenttype) {
  /*
  This function is used for comments, arguments pro and arguments con
  comment and comment type (com, pro, con) are passed as variables
  When pressed, user input is disabled and a perm is generated
  */
  const commentTextBox = textbox;
  commentTextBox.disabled = true;
  commentTextBox.nextElementSibling.disabled = true;
  const body = textbox.value;
  let randomstr = '';
  const possible = '1234567890abcdefghijklmnopqrstuvwxyz-';
  for (let i = 0; i < 5; i += 1) {
    randomstr += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  const newPerm = activePost.permlink + randomstr;
  let type;
  switch (commenttype) {
    case 'con': type = 'con'; break;
    case 'pro': type = 'pro'; break;
    default: type = ''; break;
  }
  /*
  the comment type is added to the custom JSON so during the loading of arguments
  the comment can be placed in the correct discussion element on debato
  When commenting is successful, add new comments to the active discussion page
  */
  api.comment(activePost.author, activePost.permlink, user, newPerm, '', body, JSON.parse(`{"type":"${type}"}`), (err, res) => {
    commentTextBox.disabled = false;
    commentTextBox.nextElementSibling.disabled = false;
    if (!res) { showError('Could not post your comment. Please refresh the page and try again'); return; }
    commentTextBox.value = '';
    let newArg = '';
    const contentBox = document.getElementsByClassName(commenttype)[0];
    if (contentBox.getElementsByClassName('blank').length > 0) {
      contentBox.removeChild(contentBox.getElementsByClassName('blank')[0]);
    }
    if (commenttype === 'com') {
      newArg = `<p id = de-${newPerm}><strong>${user}</strong> - ${parseHtml(body)}`;
      newArg += `<a class = "removeButton" onclick = "deleteComment('${user}','${newPerm}')">    remove</a></p>`;
    } else {
      newArg = `<h3 id = de-${newPerm}><p class='voteCounter'>0</p>`;
      newArg += `<div class = "relevantButton" onclick="upvote(this, '${user}','${newPerm}')"><div></div></div>`;
      newArg += `<a class="commentLink blackLink" onclick="writeDropDown('${user}', '${newPerm}')"> ${body}</a>`;
      newArg += `<a class = "removeButton" onclick = "deleteComment('${user}','${newPerm}')">    remove</a>`;
      showSuccess('Successfully commented on the discussion!');
    }
    contentBox.innerHTML += newArg;
    showCommentBox(contentBox.getElementsByClassName('collapsibleButton')[0]);
  });
}
function deleteComment(author, perm) {
  // Remove a comment and take it out of the list
  api.deleteComment(author, perm, (err, res) => {
    if (!res) { showError('Could not remove your comment. Please refresh the page and try again.'); return; }
    document.getElementById(`de-${perm}`).style.display = 'none';
    showSuccess('Successfully removed comment.');
  });
}
function getPostData(postobj) {
  /*
  Get modified data of a post for later use
  (thumbnail, author, title, description, rewards, permlink)
  */
  let thumbnail;
  const postJSON = JSON.parse(postobj.json_metadata);
  let tags = [];
  // eslint-disable-next-line prefer-destructuring
  if ('tags' in postJSON) { tags = postJSON.tags; }
  try {
    // eslint-disable-next-line prefer-destructuring
    thumbnail = postJSON.image[0];
  } catch (error) { thumbnail = false; }
  // eslint-disable-next-line prefer-destructuring
  const author = postobj.author;
  // eslint-disable-next-line prefer-destructuring
  let title = postobj.title;
  let description = '';
  description = JSON.parse(postobj.json_metadata).context;
  if (description === undefined) { description = ''; }
  if (title === '') {
    title = postobj.body;
    description = '';
  }
  const reward = postobj.pending_payout_value;
  const perm = postobj.permlink;
  // eslint-disable-next-line prefer-destructuring
  const created = postobj.created;
  return {
    title, thumbnail, description, author, perm, reward, tags, created,
  };
}
function getPostArguments(author, perm) {
  /*
  new Promise
  Gets all comments on an argument and filters it according
  to argument type (comment/pro/con) and sorts it if needed
  Returns a dictionary with the 3 commen types
  */
  return new Promise(((resolve, reject) => {
    const pro = [];
    const con = [];
    const com = [];
    steem.api.getContentReplies(author, perm, (err, comments) => {
      for (let i = 0; i < comments.length; i += 1) {
        try {
          // eslint-disable-next-line prefer-destructuring
          const type = JSON.parse(comments[i].json_metadata).type;
          if (type === 'pro') {
            pro.push(comments[i]);
          } else if (type === 'con') {
            con.push(comments[i]);
          } else {
            com.push(comments[i]);
          }
        } catch (error) { com.push(comments[i]); }
      }
      resolve({ pro, con, com });
    });
  }));
}
function checkForParent(post) {
  // Check if the post has a parent post and resolve the author and permink
  if (post.parent_author === '') { return false; }
  return [true, post.parent_author, post.parent_permlink];
}
function getVoteStatus(commentItem) {
  /*
  Checks if the user has already upvoted the argument
  Needed for displaying if a button has already been pressed
  Also counts the amount of total upvotes for displaying
  */
  return new Promise(((resolve, reject) => {
    steem.api.getActiveVotes(commentItem.author, commentItem.permlink, (err, votes) => {
      let selfVote = false;
      let voteCount = 0;
      if (votes.length > 0) {
        for (let j = 0; j < votes.length; j += 1) {
          if (votes[j].percent > 0) {
            voteCount += 1;
            if (votes[j].voter === user) { selfVote = true; }
          }
        }
      } resolve({ commentItem, net_votes: voteCount, voteStatus: selfVote });
    });
  }));
}
function getCommentStatus(author, perm, objId) {
  // Retrieves the comment ratio between pro|con
  return new Promise(((resolve, reject) => {
    steem.api.getContentReplies(author, perm, (err, comments) => {
      let proCount = 0;
      let conCount = 0;
      if (comments.length > 0) {
        for (let i = 0; i < comments.length; i += 1) {
          try {
            if (JSON.parse(comments[i].json_metadata).type === 'pro') {
              proCount += 1;
            } else if (JSON.parse(comments[i].json_metadata).type === 'con') {
              conCount += 1;
            }
          } catch (error) { /* Do nothing */ }
        }
      }
      resolve([`${proCount}|${conCount}`, objId]);
    });
  }));
}
function writeCommentBox(action) {
  /*
  Write the input box & button for leaving a comment
  Buttons for each action type require a specific action
  */
  let body = '';
  if (action === 'statement pro') {
    body = `<div class = "${action}Box"><button class = "collapsibleButton" onclick = "showCommentBox(this)">Add statement</button>`;
    body += '<div class = "inputZone"><textarea name = "comment" rows = "3"></textarea><br>';
    body += "<button class = 'postbutton' onclick = \"comment(this.previousElementSibling.previousElementSibling,'pro')\">post</button></div></div>";
  }
  if (action === 'statement con') {
    body = `<div class = "${action}Box"><button class = "collapsibleButton" onclick = "showCommentBox(this)">Add statement</button>`;
    body += '<div class = "inputZone"><textarea name = "comment" rows = "3"></textarea><br>';
    body += "<button class = 'postbutton' onclick = \"comment(this.previousElementSibling.previousElementSibling,'con')\">post</button></div></div>";
  }
  if (action === 'comment') {
    body = `<div class = "${action}Box"><button class = "collapsibleButton" onclick = "showCommentBox(this)">Add comment</button>`;
    body += '<div class = "inputZone"><textarea name = "comment" rows = "3"></textarea><div class = "previewElement"></div>';
    body += "<button class = 'postbutton' onclick = \"comment(this.previousElementSibling.previousElementSibling,'com')\">post</button></div></div>";
  }
  return body;
}
function writeArgumentList(comments, divID) {
  /*
  Retrieves the list of arguments (both pro and con) and returns a html usable string
  Uses the custom JSON to group different categories (pro, con)
  'comments' is the list of all comments and 'divID' determines which category will be filtered
  */
  const PromiseList = [];
  function sortReplies(replyList) {
    const sortedList = replyList.sort((a, b) => {
      if (a.net_votes < b.net_votes) {
        return 1;
      } return -1;
    });
    return sortedList;
  }
  let body = `<center>${divID.toUpperCase()}</center>`;
  if (user !== '' && user !== undefined) {
    body += writeCommentBox(`statement ${divID}`);
  }
  document.getElementsByClassName(divID)[0].innerHTML = body;
  if (comments.length > 0) {
    for (let i = 0; i < comments.length; i += 1) {
      PromiseList.push(getVoteStatus(comments[i]));
    }
    Promise.all(PromiseList).then((unsortedArguments) => {
      const values = sortReplies(unsortedArguments);
      for (let i = 0; i < values.length; i += 1) {
        let line = '';
        let voteType = 'upvote';
        const commentElement = values[i].commentItem;
        let attributes = '';
        if (values[i].voteStatus) {
          voteType = 'removeVote';
          attributes = 'activated';
        }
        line += `<h3 id = de-${commentElement.permlink}>`;
        line += `<p class='voteCounter'>${values[i].net_votes}</p>`;
        if (user !== '' && user !== undefined) {
          line += `<div class = "relevantButton ${attributes}" onclick="${voteType}(this,'${commentElement.author}','${commentElement.permlink}')">`;
          line += '<div></div></div>';
        }
        line += `<a class="commentLink blackLink" onclick="writeDropDown('${commentElement.author}','${commentElement.permlink}')"> `;
        line += `${parseHtml(commentElement.body)}<p class='ratio' id='ratio-${commentElement.permlink}'></p></a>`;
        if (commentElement.author === user
          && commentElement.children === 0
          && commentElement.active_votes.length === 0) {
          line += `<a class = "removeButton" onclick = "deleteComment('${commentElement.author}','${commentElement.permlink}')">    remove</a>`;
        }
        body += '</h3>';
        document.getElementsByClassName(divID)[0].innerHTML += line;
        getCommentStatus(commentElement.author, commentElement.permlink, `ratio-${commentElement.permlink}`).then((ratio) => {
          // eslint-disable-next-line prefer-destructuring
          document.getElementById(ratio[1]).innerHTML = ratio[0];
        });
      }
    });
  } else {
    body += '<p class = "blank">No arguments on this point</p>';
    document.getElementsByClassName(divID)[0].innerHTML = body;
  }
}
function writeCommentList(commentList) {
  // Retrieves all comments and puts then in a html usable string
  const commentCount = commentList.length;
  let body = '<div class="comment-card">';
  if (commentCount > 0) {
    body += `<button class="collapsibleButton comments" onclick="commentsDropDown(this)">View comments on this statement (${commentCount})</button>`;
    body += '<div class="commentList com">';
    if (user !== '' && user !== undefined) {
      body += writeCommentBox('comment');
    }
    for (let i = 0; i < commentCount; i += 1) {
      if (i !== 0) { body += '<hr>'; }
      let removeButton = '';
      if (user === commentList[i].author
        && commentList[i].children === 0
        && commentList[i].active_votes.length === 0) {
        removeButton = `<a class = "removeButton" onclick = "deleteComment('${commentList[i].author}','${commentList[i].permlink}')">    remove</a>`;
      }
      const commentContent = converter.makeHtml(parseHtml(commentList[i].body));
      body += `<div class = "comment" id = de-${commentList[i].permlink}><strong>${commentList[i].author}:</strong><div style="margin-left: 10px;">${commentContent}${removeButton}</div></div>`;
    }
  } else {
    body += '<button class="collapsibleButton comments" onclick="commentsDropDown(this)">There are no comments on this statement</button>';
    body += '<div class="commentList com">';
    if (user !== '' && user !== undefined) {
      body += writeCommentBox('comment');
    }
  }
  body += '</div></div>';
  return body;
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
function createDiscussionCard(post) {
  let body = '';
  const details = getPostData(post);
  body += `<div class = "discussionObj" id = "${details.perm}">`;
  body += `<button class="ObjLink" onclick="window.location.href='/html/discussion?a=${details.author}&p=${details.perm}'">`;
  if (details.thumbnail === false || details.thumbnail === '') {
    body += '<div class = "thumbnail" style = "background-image:none">';
  } else {
    body += `<div class = "thumbnail" style = "background-image:url('${details.thumbnail}')">`;
  }
  body += `<div title="${details.created}" class="ageBox">${timeSince(details.created)} ago</div>`;
  body += `<div class="ratio box" id='ratio-${details.perm}'></div></div>`;
  body += `<p class = "cardTitle">${details.title}</h2>`;
  body += '<div id = "discussionBody"></div>';
  body += '</div>';
  return body;
}
function writeDropDown(author, perm) {
  /*
  Displays the entire discussion structure for a new comment (perm)
  First checks if there is a parent post. If there is none, it should
  be regarded as a completely new discussion, otherwise just update
  the current discussed topic, add back button and leave the thumbnail
  */
  let body = '';
  steem.api.getContent(author, perm, (err, post) => {
    if (err) { showError(`Something went wrong. ${err.toString()}`); return; }
    activePost = post;
    getRootImage(activePost).then((rootimage) => { document.getElementsByClassName('thumbnail')[0].style.backgroundImage = `url(${rootimage})`; });
    getPostArguments(author, perm).then((ArgDict) => {
      const info = getPostData(post);
      document.title = `Debato - ${info.title}`;
      const metaList = document.getElementsByTagName('meta');
      metaList[0].setAttribute('content', info.description);
      const discussionBody = document.getElementById('discussionBody');
      body += '<div id = \'trianglePlaceholder\' style=\'display: inline-block\' ></div>'; // placeholder for upvote triangle
      body += `<h1 style ="display: inline-block">${info.title}</h1><br>`;
      if (info.author === user) {
        body += `<a class = "editlink" href='/html/create?p=${activePost.permlink}'>edit</a>`;
      }
      for (let i = 0; i < info.tags.length; i += 1) {
        if (info.tags[i] !== 'debato-discussion') { body += `<a class = "tag" href="/index?tag=${info.tags[i]}">${info.tags[i]}</a>`; }
      }
      body += '<div id = "backPlaceholder"></div>'; // placeholder for back button
      body += `<p><strong>By: <a href="/html/profile?u=${info.author}">${info.author}</a></strong> - ${info.reward}</p>`;
      const parsedContext = converter.makeHtml(parseHtml(info.description));
      body += `<p>${parsedContext}</p>`;
      body += writeCommentList(ArgDict.com);
      body += '<div class="argumentRow"><div class="pro argumentColumn""><center>PRO</center>';
      body += '</div><div class="con argumentColumn"><center>CON</center>';
      body += '</div></div>';
      discussionBody.innerHTML = body;
      const parentResult = checkForParent(post);
      if (parentResult[0]) {
        const backPlaceholder = document.getElementById('backPlaceholder');
        backPlaceholder.innerHTML = `<button class="backButton" onclick="writeDropDown('${parentResult[1]}','${parentResult[2]}')">back</button>`;
      }
      if (user !== '' && user !== undefined) {
        let upvoteButtonBody = '';
        getVoteStatus(post).then((values) => {
          if (values.voteStatus) {
            upvoteButtonBody += `<div class='triangle activated' onclick="removeVote(this, '${activePost.author}','${activePost.permlink}')"></div>`;
          } else {
            upvoteButtonBody += `<div class='triangle' onclick="upvote(this, '${activePost.author}','${activePost.permlink}')"></div>`;
          }
          document.getElementById('trianglePlaceholder').innerHTML = upvoteButtonBody;
        });
      }
      writeArgumentList(ArgDict.pro, 'pro');
      writeArgumentList(ArgDict.con, 'con');
      // eslint-disable-next-line no-restricted-globals
      history.pushState(info.title, info.title, `discussion?a=${author}&p=${perm}`);

      // Adding an event listener to the comment box which updates the comment preview
      document.getElementsByClassName('commentBox')[0].getElementsByTagName('textarea')[0].addEventListener('keyup', () => {
        const previewElement = document.getElementsByClassName('previewElement')[0];
        const contextValue = document.getElementsByClassName('commentBox')[0].getElementsByTagName('textarea')[0].value;
        previewElement.innerHTML = converter.makeHtml(parseHtml(contextValue));
      });
    });
  });
}
