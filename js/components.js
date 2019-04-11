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
  line += `<div class="argumentCard"  id = de-${commentElement.permlink} style="display: flex;justify-content: space-between">`;
  line += '<span style=" line-height:100%; padding:5px;margin:auto 0 auto 0;"><center>';
  line += `<div class='voteCounter'>${values.net_votes}`;
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
  line += '</center></span>';
  line += '<span style="width:100%;padding: 5px;margin:auto 0 auto 0;">';
  line += `<a class="commentLink blackLink" style="font-size:1.2em;" onclick="writeDiscussionContent('${commentElement.author}','${commentElement.permlink}')"> `;
  line += `${parseHtml(commentElement.body)}</a></span>`;
  line += '<span style="padding: 5px;margin:auto 0 auto 0;text-align: -webkit-center;">';
  line += `<p class='ratio' id='ratio-${commentElement.permlink}'></p>`;
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
  line += '</span></div>';
  return line;
}
function createDiscussionCard(post) {
  let body = '';
  const details = getPostData(post);
  body += `<div class = "discussionObj" id = "${details.perm}">`;
  body += `<button class="ObjLink" onclick="window.location.href='/html/discussion?a=${details.author}&p=${details.perm}'">`;
  if (details.thumbnail === false || details.thumbnail === '') {
    body += '<div class = "thumbnail" style = "background-image:url(\'/imgs/placeholder.svg\')">';
  } else {
    body += `<div class = "thumbnail" style = "background-image:url('${details.thumbnail}')">`;
  }
  body += `<div title="${details.created}" class="ageBox">${timeSince(details.created)} ago</div>`;
  body += `<div class="ratio box" id='ratio-${details.perm}'></div></div>`;
  body += '<p class = "cardTitle">';
  if (isHot(post)) { body += '<i class="fas fa-fire-alt" title="Hot!" style="color:rgb(121, 6, 2);"></i> '; }
  body += `${details.title}</h2>`;
  body += '<div id = "discussionBody"></div>';
  body += '</div>';
  return body;
}
function createCommentBox(action, author = '', perm = '') {
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
    body += '<div class = "inputZone"><textarea name = "comment" rows = "3"  onkeyup="updateTextPreview(this)"></textarea><div class = "previewElement"></div>';
    body += "<button class = 'postbutton' onclick = \"comment(this.previousElementSibling.previousElementSibling,'com')\">post</button></div></div>";
  }
  if (action === 'reply') {
    body += '<div class="replyBox" style="margin-right:10px; display: none; max-width:100%;">';
    body += '<textarea name = "comment" rows = "3" style="max-width:100%;"  onkeyup="updateTextPreview(this)"></textarea><div class = "previewElement"></div>';
    body += `<button class = 'postbutton' onclick = "comment(this.previousElementSibling.previousElementSibling,'com', '${author}', '${perm}')">post</button>`;
    body += '<a onclick="this.parentElement.parentElement.parentElement.parentElement.getElementsByClassName(\'commentButton\')[0].click()" style="text-decoration:none; font-size:0.8em;">Cancel</a></div>';
  }
  return body;
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
  commentItem += '</div></div>';
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
  let body = '<div class="argumentCard">';
  body += `<p style="font-size: 0.9em; color: ">Argumented (${values.postType}) on: `;
  body += `<a href="/html/discussion?a=${values.parentAuthor}&p=${values.parentPerm}">${values.parentTitle}</a>`;
  body += ` by <a href="/html/profile?u=${values.parentAuthor}">${values.parentAuthor}</a></p>`;
  body += `<p style="font-size:1.2em;"><a class="blackLink" href = "/html/discussion?a=${values.author}&p=${values.perm}">${values.title}</a></p>`;
  body += `<p title="${values.created}">${values.reward} - ${timeSince(values.created)} ago</p>`;
  body += '</div>';
  return body;
}
