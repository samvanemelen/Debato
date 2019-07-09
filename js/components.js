/* eslint-disable no-unused-vars */
/* global getPostData isHot timeSince parseHtml :true */
function createArgumentCard(values) {
  /*
    the 'values' parameter is a dictionary with the following attributes:
      - commentElement
        * permlink
        * author
        * active_votes (list)
        * json_metadata: {"type":"..."}
        * body
        * created
        * children
      - net_votes
      - voteStatus
      - voteList
  */
  let line = '';
  let voteType = 'upvote';
  const commentElement = values.commentItem;
  let attributes = '';
  if (values.voteStatus) {
    voteType = 'removeVote';
    attributes = 'activated';
  }
  line += `<div class="argumentCard"  id = de-${commentElement.permlink}><div style="display: flex;justify-content: space-between">
    <span style=" line-height:100%; padding:5px;margin:auto 0 auto 0;"><center>
    <div class='voteCounter moreInfo'>${values.net_votes}`;
  if (values.net_votes > 0) {
    line += '<span class="voterList">';
    for (let i = 0; i < values.net_votes; i += 1) {
      line += `<p>${values.voteList[i].voter} - ${values.voteList[i].percent / 100}%</p>`;
    }
    line += '</span>';
  }
  line += '</div><br>';
  if (user !== '' && user !== undefined) {
    line += `<i class="fas fa-chevron-circle-up relevantButton ${attributes}" onclick="${voteType}(this,'${commentElement.author}','${commentElement.permlink}')"></i>`;
  }
  line += `</center></span>
    <span style="width:100%;padding: 5px;margin:auto 0 auto 0;">
    <a class="commentLink blackLink" style="font-size:1.2em;" onclick="writeDiscussionContent('${commentElement.author}','${commentElement.permlink}')">
    ${parseHtml(commentElement.body)}</a></span>
    <span style="padding: 5px;margin:auto 0 auto 0;text-align: -webkit-center;">
    <div class="childCount">${commentElement.children}</div>`;
  if (commentElement.author === user) { // Original author of the comment
    line += `<i id="more-${commentElement.permlink}" class="far fa-caret-square-down moreIcon">`;
    // eslint-disable-next-line prefer-destructuring
    line += `<ul><li><a class="editButton" onclick="editComment('${commentElement.permlink}','${parseHtml(commentElement.body)}','${JSON.parse(commentElement.json_metadata).type}')">edit</a></li>`;
    if (commentElement.children === 0 // No received comments
            && commentElement.active_votes.length === 0 // No received votes
            && (new Date() - new Date(commentElement.created)) / 86400000 < 7) { // < 7 days
      line += `<li><a class="removeButton" onclick="deleteComment('${commentElement.author}','${commentElement.permlink}')">remove</a></li>`;
    }
    line += '</ul></i>';
  }
  line += `</span></div><div class="ratiobar" id="ratio-${commentElement.permlink}"><div class="probar"></div><div class="conbar"></div></div>`;
  return line;
}
function createDiscussionCard(post) {
  /*
  The post variable is a default post object as returned from the steemJS api with at least:
    json_metadata (with image)
    author
    title
    pending_payout_value
    permlink
    created
    children
  */
  let body = '';
  const details = getPostData(post);
  body += `<div class = "discussionObj" id = "${details.perm}">
    <button class="ObjLink" onclick="window.location.href='/html/discussion?a=${details.author}&p=${details.perm}'">`;
  if (details.thumbnail === false || details.thumbnail === '') {
    body += '<div class = "thumbnail" style = "background-image:url(\'/imgs/placeholder.svg\')">';
  } else {
    body += `<div class = "thumbnail" style = "background-image:url('${details.thumbnail}')">`;
  }
  body += `<div title="${details.created}" class="ageBox">${timeSince(details.created)} ago</div>
    <div class="children box">${post.children} <i class="far fa-comment"></i></div></div>
    <div class="ratiobar" id="ratio-${details.perm}"><div class="probar"></div><div class="conbar"></div></div>
    <p class = "cardTitle">`;
  if (isHot(post)) { body += '<i class="fas fa-fire-alt" title="Hot!" style="color:rgb(121, 6, 2);"></i> '; }
  body += `${details.title}</h2>
    <div id = "discussionBody"></div>
    </div>`;
  return body;
}
function createCommentBox(action, author = '', perm = '') {
  /*
    Write the input box & button for leaving a comment
    Buttons for each action type require a specific action
    */
  if (action === 'statement pro') {
    return `<div class = "${action}Box"><button class = "collapsibleButton" onclick = "showCommentBox(this)">Add statement</button>
      <div class = "inputZone"><p class="remainingChars">300 characters remaining (leave longer stories or references in a comment on your argument)</p>
      <textarea name = "comment" rows = "3" maxlength="300" oninput="updateCharCount(this)"></textarea><br>
      <button class = 'postbutton' onclick = "comment(this.previousElementSibling.previousElementSibling,'pro')">post</button></div></div>`;
  }
  if (action === 'statement con') {
    return `<div class = "${action}Box"><button class = "collapsibleButton" onclick = "showCommentBox(this)">Add statement</button>
      <div class = "inputZone"><p class="remainingChars">300 characters remaining (leave longer stories or references in a comment on your argument)</p>
      <textarea name = "comment" rows = "3" maxlength="300" oninput="updateCharCount(this)"></textarea><br>
      <button class = 'postbutton' onclick = "comment(this.previousElementSibling.previousElementSibling,'con')">post</button></div></div>`;
  }
  if (action === 'comment') {
    return `<div class = "${action}Box"><button class = "collapsibleButton" onclick = "showCommentBox(this)">Add comment</button>
      <div class = "inputZone"><textarea name = "comment" rows = "3"  oninput="updateTextPreview(this)"></textarea><div class = "previewElement"></div>
      <button class = 'postbutton' onclick = "comment(this.previousElementSibling.previousElementSibling,'com')">post</button></div></div>`;
  }
  if (action === 'reply') {
    return `<div class="replyBox" style="margin-right:10px; display: none; max-width:100%;">
      <textarea name = "comment" rows = "3" style="max-width:100%;"  oninput="updateTextPreview(this)"></textarea><div class = "previewElement"></div>
      <button class = 'postbutton' onclick = "comment(this.previousElementSibling.previousElementSibling,'com', '${author}', '${perm}')">post</button>
      <a onclick="this.parentElement.parentElement.parentElement.parentElement.getElementsByClassName('commentButton')[0].click()" style="text-decoration:none; font-size:0.8em;">Cancel</a></div>`;
  }
  return '';
}
function createCommentCard(values) {
  /*
    the 'values' parameter is a dictionary with the following attributes:
      - commentItem
        * permlink
        * author
        * active_votes (list)
        * json_metadata: {"type":"..."}
        * body
        * created
      - net_votes
      - voteStatus
      - voteList
      - (mainComment) optionally when discussion is a reply of another comment
  */
  const comment = values.commentItem;
  let commentItem = '';
  let moreMenu = '';
  let voteType = 'upvote';
  let attributes = '';
  let mainComment = true;
  let commentPrefix = 'de';
  if ('mainComment' in values) {
    mainComment = false;
    commentPrefix = 'do';
  }
  if (values.voteStatus) {
    voteType = 'removeVote';
    attributes = 'activated';
  }
  if (comment.author === user) { // Original author of the comment
    moreMenu += `<i id="more-${comment.permlink}" class="far fa-caret-square-down moreIcon"  style='position: relative;'>`;
    // eslint-disable-next-line prefer-destructuring
    moreMenu += `<ul><li><a class="editButton" onclick="editComment('${comment.permlink}','${parseHtml(comment.body)}','${JSON.parse(comment.json_metadata).type}')">edit</a></li>`;
    if ((comment.children === 0) // No received comments
        && (comment.active_votes.length === 0) // No received votes
        && (new Date() - new Date(comment.created)) / 86400000 < 7) { // < 7 days
      moreMenu += `<li><a class="removeButton" onclick="deleteComment('${comment.author}','${comment.permlink}')">remove</a></li>`;
    }
    moreMenu += '</ul></i>';
  }
  const commentContent = converter.makeHtml(parseHtml(comment.body));
  if (!mainComment) {
    commentItem += `<div class = "comment argumentCard" style="box-shadow:none; margin:0" id="${commentPrefix}-${comment.permlink}">`;
  } else {
    commentItem += `<div class = "comment argumentCard" id="${commentPrefix}-${comment.permlink}">`;
  }
  commentItem += '<div style=" line-height:100%; padding:5px 10px; margin-top: 20px;"><center>';
  commentItem += `<div class='voteCounter'>${values.net_votes}`;
  if (values.net_votes > 0) {
    commentItem += '<span class="voterList">';
    for (let i = 0; i < values.net_votes; i += 1) {
      commentItem += `<p>${values.voteList[i].voter} - ${values.voteList[i].percent / 100}%</p>`;
    }
    commentItem += '</span>';
  }
  commentItem += '</div><br>';
  if (user !== '' && user !== undefined) {
    commentItem += `<i class="fas fa-chevron-circle-up relevantButton ${attributes}" onclick="${voteType}(this,'${comment.author}','${comment.permlink}')"></i>`;
    if (!mainComment) {
      commentItem += '<br><a><i class="far fa-comment commentButton" style="margin-top:0.3em;" onclick = "showReplyBox(this, true)"></i></a>';
    }
  }
  commentItem += '</center></div>';
  if (mainComment) {
    commentItem += `<div style="margin: 20px 0; padding-left: 10px; max-width: 100%">${moreMenu} <strong><a class="blackLink" href="/html/profile?u=${comment.author}">${comment.author}</a>:</strong>`;
    commentItem += ` <a style="margin-left: 2em; text-decoration: none; test-size:0.9em;" onclick="openComment('${comment.author}', '${comment.permlink}')">open ${comment.children} responses</a>`;
  } else {
    commentItem += `<div style="margin-top: 20px; padding-left: 10px; width: 100%; border-left: 1px solid rgba(0,85,81, 0.2)">${moreMenu} <strong><a class="blackLink" href="/html/profile?u=${comment.author}">${comment.author}</a>:</strong>`;
  }
  commentItem += `<div class="commentContext" style="margin: 10px 20px 0 10px;">${commentContent}</div>`;
  if (!mainComment) {
    commentItem += createCommentBox('reply', comment.author, comment.permlink);
    commentItem += '<div class="repliesPlaceholder" style="max-width: 100%;"></div>';
  }
  commentItem += '</div></div></div>';
  return commentItem;
}
function createProfileArgumentCard(values) {
  /*
    the 'values' parameter is a dictionary with the following attributes:
      - postType
      - parentAuthor
      - parentPerm
      - parentTitle
      - author
      - perm
      - title
      - created
      - reward
  */
  return `<div class="argumentCard">
    <p style="font-size: 0.9em; color: ">Argumented (${values.postType}) on:
      <a href="/html/discussion?a=${values.parentAuthor}&p=${values.parentPerm}">${values.parentTitle}</a>
    by <a href="/html/profile?u=${values.parentAuthor}">${values.parentAuthor}</a></p>
    <p style="font-size:1.2em;"><a class="blackLink" href = "/html/discussion?a=${values.author}&p=${values.perm}">${values.title}</a></p>
    <p title="${values.created}">${values.reward} - ${timeSince(values.created)} ago</p>
  </div>`;
}
function header() {
  return `<i class="fas fa-bars mobile_menu" onclick="document.getElementById('mainMenu').style.display = 'block'"></i>
    <nav id="mainMenu">
    <span id="fade"  onclick="document.getElementById('mainMenu').style.display = 'none'"></span>
    <ul>
        <i class="fas fa-times exit_btn" onclick="document.getElementById('mainMenu').style.display = 'none'"></i>
        <li class="show_logged_in"><div id="profilePreview"></div></li>
        <br>
        <li class="show_logged_in"><div><input class = "voteSlider" type = "range" min = "1" max = "10000" value = "10000"><p class = "voteIndicator">100% upvotes</p></div></li>
        <li><a href="/">Browse discussions</a></li>
        <li class="show_logged_in"><a href="/html/create">Start discussion</a></li>
        <li class="show_logged_in"><a class="profileLink" href="/html/profile">My profile</a></li>
        <br>
        <li class="hide_logged_in"><a href = 'https://signup.steemit.com/?ref=debato'>Sign up</a></li>
        <li class="hide_logged_in"><a class = "SClink">Log in</a></li>
        <br class="hide_logged_in">
        <li><a href="/html/about">About</a></li>
      <li class="show_logged_in"><a onclick = "logout()">Log out</a></li>
    </ul>
  </nav
  ><a class="homelink blackLink" href="/index">DEBATO <p style="display: inline-block; margin: 0; margin-left: 0.5em; font-size: 0.45em; font-weight: 100;">BETA</p></a>
  <a id = "createAccount" class="blackLink hide_logged_in hide_on_mobile" href = 'https://signup.steemit.com/?ref=debato'>Sign up</a>
  <div id="accountBox" onclick="toggleMenu();" onmouseover="toggleMenu(true);" onmouseleave="toggleMenu(false);">
    <div id = "accountLogin"><a id ="SteemConnect" class="blackLink SClink">
        Log in
    </a></div>
    <div id="accountMenu">
        <div><input class = "voteSlider" type = "range" min = "1" max = "10000" value = "10000"><p class = "voteIndicator">100% upvotes</p></div>
        <a class="blackLink" href="/html/create">Start discussion</a>
        <a class="blackLink profileLink" href="/html/profile">My profile</a>
        <br>
        <a class="blackLink" href="/html/about">About</a>
        <a class="blackLink" onclick = "logout()">Log out</a>
    </div>
  </div>`;
}
function footer() {
  return `<span>
    <p class = "head">DISCUSS</p>
    <p><a onclick=" if (user === '' || user === undefined){showError('You need to log in before creating a new discussion')}
                    else{window.location.href='/html/create'}">
    Create discussion</a></p>
    <p><a href = "/index">Browse discussions</a></p>
    <p><a class = "SClink hide_logged_in">Log in</a></p>
    <p><a  class="hide_logged_in" href = 'https://signup.steemit.com/?ref=debato'>Create account</a></p>
    <p><a class="show_logged_in" onclick = 'logout()'>Log out</a></p>
  </span>
  <span>
    <p class = "head">DEBATO</p>
    <p><a href = "/html/about?t=Debato">About Debato</a></p>
    <p><a href = "/html/about?t=Steem">About Steem</a></p>
    <p><a href = "/html/about?t=Support">Support us</a></p>
    <p><a href = "https://twitter.com/debato_org">News</a></p>
  </span>
  <span>
    <p class = "head">LEARN (coming soon)</p>
    <p><a>How to use Debato</a></p>
    <p><a>Steem blockchain</a></p>

  </span>
  <span>
    <p class = "head">CONNECT</p>
    <p><a style="font-size:1.2em;" href = "https://twitter.com/debato_org" target="_blank"><i class="fab fa-twitter-square"></i> Twitter</a></p>
    <p><a style="font-size:1.2em;" href = "https://discordapp.com/invite/VRpwMD9" target="_blank"><i class="fab fa-discord"></i> Discord</a></p>
    <p><a style="font-size:1.2em;" href = "https://github.com/samvanemelen/debato" target="_blank"><i class="fab fa-github"></i> Github</a></p>
  </span>`;
}
