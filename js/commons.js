/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
user = ''; accessToken = ''; expiresIn = ''; weight = 10000;
activePerm = ''; readingAuthor = ''; readingPerm = ''; activeAuthor = '';
parentAuthor = 'none';
parentPerm = 'none';
const weightSlider = document.getElementById('voteSlider');
weight = 10000;
let api;
// eslint-disable-next-line func-names
weightSlider.oninput = function () {
  // When the weight slider changes, change the cookie and change the indicator
  weight = this.value;
  document.getElementById('voteIndicator').innerHTML = `${this.value / 100}% upvotes`;
  document.cookie = `weight=${weight};`;
};
function toggleMenu(show) {
  /*
  When the user hovers over the Account element it checks if the user is logged in
  -> the user is not '' nor undefined
  if this is the case the max height is set to 200px, if the user leaves the element
  max height is set to 0
  */
  const accountMenu = document.getElementById('accountMenu');
  if (user !== '' && user !== undefined) {
    if (show) { accountMenu.style.maxHeight = '200px'; } else { accountMenu.style.maxHeight = '0'; }
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
    try {
      const cookieresult = document.cookie.split(';');
      // eslint-disable-next-line prefer-destructuring
      user = cookieresult[0].split('=')[1];
      // eslint-disable-next-line prefer-destructuring
      accessToken = cookieresult[1].split('=')[1];
      weight = parseInt(cookieresult[2].split('=')[1], 10);
      weightSlider.value = weight;
      document.getElementById('voteIndicator').innerHTML = `${weightSlider.value / 100}% upvotes`;
    } catch (err) { console.log(err); }

    if (accessToken !== '') {
      steem.api.getAccounts([user], (err, result) => {
        const name = user;
        const profileImage = JSON.parse(result[0].json_metadata).profile.profile_image;
        const body = `<div id = "profileImage" style="background-image:url(${profileImage}); display:inline-block;"></div><p style="color:#000000; font-size:22px"><strong>${name}</strong></p>`;
        document.getElementById('accountLogin').innerHTML = body;
        document.getElementById('accountBox').style.backgroundColor = 'none';
        api = sc2.Initialize({
          app: 'debato-app',
          callbackURL: 'http://www.debato.org',
          accessToken,
          scope: ['vote', 'comment', 'delete_comment'],
        });
      });
    } else {
      const redirURL = window.location.href.split('/').slice(0, 3).join('/');
      const link = `<a href = "https://steemconnect.com/oauth2/authorize?client_id=debato-app&redirect_uri=${redirURL}&scope=vote,comment,delete_comment"><div id = "SteemConnect">Log in</div></a>`;
      document.getElementById('accountLogin').innerHTML = link;
    }
  } catch (error) { accessToken = ''; }
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
  document.cookie = `username=${user};expires=expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  document.cookie = `accessToken=${accessToken};expires=expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  document.cookie = `weight=${weight};expires=expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  user = '';
  accessToken = '';
  expiresIn = '';
  api.revokeToken((err, res) => {
    window.location.href = '/index';
  });
}
function upvote(obj, author, perm) {
  // Upvote a post and change the settings of the upvote button
  if (obj.children.length > 0) {
    obj.children[0].style.backgroundColor = 'black';
  }
  api.vote(user, author, perm, weight, (err, res) => {
    if (res) {
      obj.setAttribute('onclick', `removeVote(this, '${author}', '${perm}')`);
      if (obj.children.length > 0) {
        obj.style.backgroundColor = '#3b9954';
      } else {
        obj.style.borderBottom = '25px solid #3b9954';
      }
    } else {
      alert('Could not broadcast vote. Please refresh the page and try again');
    }
    if (obj.children.length > 0) {
      obj.children[0].style.backgroundColor = 'inherit';
      obj.previousElementSibling.innerHTML = parseInt(obj.previousElementSibling.innerHTML, 10) + 1;
    }
  });
}
function removeVote(obj, author, perm) {
  /*
  Set an upvote value to 0
  change the settings of the button
  remove the element from the page
  */
  if (obj.children.length > 0) {
    obj.children[0].style.backgroundColor = 'black';
  }
  api.vote(user, author, perm, 0, (err, res) => {
    if (res) {
      obj.setAttribute('onclick', `upvote(this, '${author}', '${perm}')`);
      if (obj.children.length > 0) {
        obj.style.backgroundColor = '#3b9954';
      } else {
        obj.style.borderBottom = '25px solid #ccc';
      }
    } else {
      alert('Could not remove vote. Please refresh the page and try again');
    }
    if (obj.children.length > 0) {
      obj.children[0].style.backgroundColor = 'inherit';
      if (parseInt(obj.previousElementSibling.innerHTML, 10) > 0) {
        const prevElement = obj.previousElementSibling;
        prevElement.innerHTML = parseInt(obj.previousElementSibling.innerHTML, 10) - 1;
      }
    }
  });
}
function comment(textbox, commenttype) {
  /*
  This function is used for comments, arguments pro and arguments con
  comment and comment type (com, pro, con) are passed as variables
  When pressed, user input is disabled and a perm is generated
  */
  textbox.disabled = true;
  textbox.nextElementSibling.disabled = true;
  const prefix = '';
  const body = textbox.value;
  let randomstr = '';
  const possible = '1234567890abcdefghijklmnopqrstuvwxyz-';
  for (let i = 0; i < 5; i += 1) {
    randomstr += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  const newPerm = readingPerm + randomstr;
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
  api.comment(readingAuthor, readingPerm, user, newPerm, '', body, JSON.parse(`{"type":"${type}"}`), (err, res) => {
    textbox.disabled = false;
    textbox.nextElementSibling.disabled = false;
    if (!res) { alert('Could not post your comment. Please refresh the page and try again'); return; }
    textbox.value = '';
    let newArg = '';
    if (commenttype === 'com') {
      newArg = `<p id = de-${newPerm}><strong>${user}</strong> - ${body}`;
      newArg += `<a class = "removeButton" onclick = "deleteComment('${user}','${newPerm}')">    remove</a></p>`;
    } else {
      newArg = `<h3 id = de-${newPerm}><p class='voteCounter'>0</p>`;
      newArg += `<div class = "relevantButton" onclick="upvote(this, '${user}','${newPerm}')"><div></div></div>`;
      newArg += `<a class="commentLink" onclick="writeDropDown(event,'${user}', '${newPerm}')"> ${body}</a>`;
      newArg += `<a class = "removeButton" onclick = "deleteComment('${user}','${newPerm}')">    remove</a>`;
    }
    document.getElementsByClassName(commenttype)[0].innerHTML += newArg;
  });
}
function deleteComment(author, perm) {
  // Remove a comment and take it out of the list
  api.deleteComment(author, perm, (err, res) => {
    if (!res) { alert('Could not remove your comment. Please refresh the page and try again'); return; }
    document.getElementById(`de-${perm}`).style.display = 'none';
  });
}
function openDropDown(perm, extra = 0) {
  // Opens a selected discussion on the home page CURRENTLY NOT IN USE
  const element = document.getElementById(perm).getElementsByClassName('discussionBody')[0];
  element.style.maxHeight = 'none';
  element.style.height = 'auto';
}
function commentsDropDown(obj) {
  // Display the comment section of a certain discussion
  let content;
  if (obj.className.indexOf('comments') !== -1) { content = obj.nextElementSibling; } else { content = obj.parentElement.parentElement.firstElementChild.nextElementSibling; }

  if (content.style.maxHeight && (content.style.maxHeight === (`${content.scrollHeight}px`) || content.style.maxHeight === '500px')) {
    content.style.maxHeight = null;
    content.style.borderStyle = 'none';
  } else if (content.scrollHeight > 500) { content.style.maxHeight = '500px'; content.style.overflow = 'scroll'; } else { content.style.maxHeight = `${content.scrollHeight}px`; }
  openDropDown(activePerm, content.scrollHeight);
}
function showCommentBox(buttonObj) {
  // Displays the text area for typing a new comment
  const commentobj = buttonObj.parentElement.parentElement;
  const textbox = buttonObj.nextElementSibling;
  if (textbox.style.display === 'none' || textbox.style.display === '') {
    textbox.style.display = 'block';
    if (commentobj.style.overflow !== ('scroll')) { commentobj.style.maxHeight = 'none'; }
  } else { textbox.style.display = 'none'; }
  openDropDown(activePerm, textbox.scrollHeight);
  if (commentobj.style.maxHeight !== '500px' && buttonObj.parentElement.className !== 'statementBox') {
    commentsDropDown(buttonObj);
  }
}
function closeDropDown(perm) {
  // Closes an opened discussion on the home page CURRENTLY NOT IN USE
  if (perm === '') { return; }
  const elements = document.getElementsByClassName('discussionBody');
  for (let i = 0; i < elements.length; i += 1) {
    elements[i].style.maxHeight = null;
  }
  parentAuthor = 'none';
  parentPerm = 'none';
  activePerm = '';
  activeAuthor = '';
}
function getPostData(postobj) {
  /*
  Get modified data of a post for later use
  (thumbnail, author, title, description, rewards, permlink)
  */
  let thumbnail;
  try {
    // eslint-disable-next-line prefer-destructuring
    thumbnail = JSON.parse(postobj.json_metadata).image[0];
  } catch (error) { thumbnail = false; }
  // eslint-disable-next-line prefer-destructuring
  const author = postobj.author;
  // eslint-disable-next-line prefer-destructuring
  let title = postobj.title;
  let description = '';
  try {
    description = JSON.parse(postobj.json_metadata).context;
    if (description === undefined) { description = ''; }
  } catch (error) { console.log(error); }
  if (title === '') {
    title = postobj.body;
    description = '';
  }
  const reward = postobj.pending_payout_value;
  const perm = postobj.permlink;
  return {
    title, thumbnail, description, author, perm, reward,
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
function checkForParent(author, perm) {
  // Check if the post has a parent post and resolve the author and permink
  return new Promise(((resolve, reject) => {
    steem.api.getContent(author, perm, (err, post) => {
      if (post.parent_author === '') { resolve([false]); } else { resolve([true, post.parent_author, post.parent_permlink]); }
    });
  }));
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
          if (JSON.parse(comments[i].json_metadata).type === 'pro') {
            proCount += 1;
          } else if (JSON.parse(comments[i].json_metadata).type === 'con') {
            conCount += 1;
          }
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
    body += "<button onclick = \"comment(this.previousElementSibling.previousElementSibling,'pro')\">post</button></div></div>";
  }
  if (action === 'statement con') {
    body = `<div class = "${action}Box"><button class = "collapsibleButton" onclick = "showCommentBox(this)">Add statement</button>`;
    body += '<div class = "inputZone"><textarea name = "comment" rows = "3"></textarea><br>';
    body += "<button onclick = \"comment(this.previousElementSibling.previousElementSibling,'con')\">post</button></div></div>";
  }
  if (action === 'comment') {
    body = `<div class = "${action}Box"><button class = "collapsibleButton" onclick = "showCommentBox(this)">Add comment</button>`;
    body += '<div class = "inputZone"><textarea name = "comment" rows = "3"></textarea><br>';
    body += "<button onclick = \"comment(this.previousElementSibling.previousElementSibling,'com')\">post</button></div></div>";
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
  document.getElementById(activePerm).getElementsByClassName(divID)[0].innerHTML = body;
  if (comments.length > 0) {
    for (let i = 0; i < comments.length; i += 1) {
      PromiseList.push(getVoteStatus(comments[i]));
    }
    Promise.all(PromiseList).then((values) => {
      values = sortReplies(values);
      for (let i = 0; i < values.length; i += 1) {
        let line = '';
        let voteType = 'upvote';
        const commentElement = values[i].commentItem;
        let attributes = '';
        if (values[i].voteStatus) {
          voteType = 'removeVote';
          attributes = " style = \"background-color: #3b9954\" onmouseover=\"this.style.backgroundColor ='#ba5925';\" onmouseout=\"this.style.backgroundColor='#3b9954';\"";
        }
        line += `<h3 id = de-${commentElement.permlink}>`;
        if (user !== '' && user !== undefined) {
          line += `<p class='voteCounter'>${values[i].net_votes}</p>`;
          line += `<div class = "relevantButton" onclick="${voteType}(this,'${commentElement.author}','${commentElement.permlink}')" ${attributes}>`;
          line += '<div></div></div>';
        }
        line += `<a class="commentLink" onclick="writeDropDown(event,'${commentElement.author}','${commentElement.permlink}')"> `;
        line += `${commentElement.body}<p class='ratio' id='ratio-${commentElement.permlink}'></p></a>`;
        if (commentElement.author === user
          && commentElement.children === 0
          && commentElement.active_votes.length === 0) {
          line += `<a class = "removeButton" onclick = "deleteComment('${commentElement.author}','${commentElement.permlink}')">    remove</a>`;
        }
        body += '</h3>';
        document.getElementById(activePerm).getElementsByClassName(divID)[0].innerHTML += line;
        getCommentStatus(commentElement.author, commentElement.permlink, `ratio-${commentElement.permlink}`).then((ratio) => {
          // eslint-disable-next-line prefer-destructuring
          document.getElementById(ratio[1]).innerHTML = ratio[0];
        });
      }
    });
  } else {
    body += '<p>No arguments on this point</p>';
    document.getElementById(activePerm).getElementsByClassName(divID)[0].innerHTML = body;
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
      let removeButton = '';
      if (user === commentList[i].author
        && commentList[i].children === 0
        && commentList[i].active_votes.length === 0) {
        removeButton = `<a class = "removeButton" onclick = "deleteComment('${commentList[i].author}','${commentList[i].permlink}')">    remove</a>`;
      }
      body += `<p class = "comment" id = de-${commentList[i].permlink}><strong>${commentList[i].author}</strong> - ${commentList[i].body}${removeButton}</p>`;
    }
  } else {
    body = '<button class="collapsibleButton comments" onclick="commentsDropDown(this)">There are no comments on this statement</button>';
    body += '<div class="commentList">';
    if (user !== '' && user !== undefined) {
      body += writeCommentBox('comment');
    }
  }
  body += '</div></div>';
  return body;
}
function writeDropDown(evt, author, perm) {
  /*
  Displays the entire discussion structure for a new comment (perm)
  First checks if there is a parent post. If there is none, it should
  be regarded as a completely new discussion, otherwise just update
  the current discussed topic, add back button and leave the thumbnail
  */
  checkForParent(author, perm).then((parent) => {
    if (!parent[0]) { // There is no higher parent
      if (parentPerm === '' && parentAuthor === '') { // This is discussion top statement
        let shouldreturn = false;
        if (perm === activePerm) { shouldreturn = true; }
        closeDropDown(activePerm);
        if (shouldreturn) { return; }
      }
      activePerm = perm; activeAuthor = author; // new main discussion
      readingPerm = perm; readingAuthor = author; // currently reading the main discussion
      parentPerm = ''; parentAuthor = ''; // Reset parents
    } else { // previous perm (parent) becomes parent en current perm becomes reading Perm
      // eslint-disable-next-line prefer-destructuring
      parentPerm = parent[2];
      // eslint-disable-next-line prefer-destructuring
      parentAuthor = parent[1];
      readingPerm = perm;
      readingAuthor = author;
    }
    const bodydiv = document.getElementById(activePerm);
    const allDiscussionBodies = document.getElementsByClassName('discussionBody');
    let body = '';
    steem.api.getContent(author, perm, (err, post) => {
      getPostArguments(author, perm).then((ArgDict) => {
        const info = getPostData(post);
        const discussionBody = bodydiv.getElementsByClassName('discussionBody')[0];
        body += `<div id = 'button-${readingPerm}' style='display: inline-block' ></div>`;
        body += `<h1>${info.title}</h1>`;
        if (parentAuthor !== '' && parentPerm !== '') {
          body += `<button class="backButton" onclick = "writeDropDown(event,'${parentAuthor}','${parentPerm}')">back</button>`;
        }
        body += `<p><strong>By: ${info.author}</strong> - ${info.reward}</p>`;
        body += `<p>${info.description}</p>`;
        body += writeCommentList(ArgDict.com);
        body += '<div class="argumentRow"><div class="pro argumentColumn""><center>PRO</center>';
        body += '</div><div class="con argumentColumn"><center>CON</center>';
        body += '</div></div>';
        discussionBody.innerHTML = body;
        openDropDown(activePerm);
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
  });
}
