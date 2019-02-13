/* global updateLoginStatus getUrlVars getPostData getCommentStatus:true */
/* eslint-disable no-unused-vars */
let activeTab = '';
const PostPerLoad = 6;
const currentURL = window.location.href;
let expiresIn = '';
if (currentURL.includes('access_token')) {
  const vars = getUrlVars();
  accessToken = vars.access_token;
  expiresIn = vars.expires_in;
  user = vars.username;
  const expiresOn = new Date();
  const weightSlider = document.getElementById('voteSlider');
  expiresOn.setSeconds(expiresOn.getSeconds() + parseInt(expiresIn, 10));
  document.cookie = `username=${user};expires=${expiresOn}; path=/;`;
  document.cookie = `accessToken=${accessToken};expires=${expiresOn}; path=/;`;
  document.cookie = `weight=${weightSlider.value}; path=/;`;
}
updateLoginStatus();
document.getElementById('defaultOpen').click();
function writeDiscussionList(postlist, loadedAmount, previous) {
  /*
  Loads a list of discussion according to the provided postlist and amount
  Returns the html objects that make up the cards on the index page
  There is one more post loaded than will be displayed to check if there
  exist more posts (and consequently show a 'more' button)
  */
  const Listbox = document.getElementById(activeTab).getElementsByClassName('discussionList')[0];
  let actualAmount = loadedAmount;
  if (loadedAmount === PostPerLoad) { Listbox.innerHTML = ''; } // The first amount of posts is loaded so reset Listbox
  if (postlist.length < loadedAmount) { actualAmount = postlist.length; }
  for (let i = previous; i < actualAmount; i += 1) {
    let body = '';
    const details = getPostData(postlist[i]);
    body += `<div class = "discussionObj" id = "${details.perm}"><button class="ObjLink" onclick="window.location.href='/html/discussion?a=${details.author}&p=${details.perm}'">`;
    if (details.thumbnail === false || details.thumbnail === '') {
      body += `<div class = "thumbnail" style = "background-image:none"><p class="ratio box" id='ratio-${details.perm}'></p></div>`;
    } else {
      body += `<div class = "thumbnail" style = "background-image:url('${details.thumbnail}')"><div class="ratio box" id='ratio-${details.perm}'></div></div>`;
    }
    body += `<p class = "cardTitle">${details.title}</h2>`;
    body += '<div id = "discussionBody"></div>';
    body += '</div>';
    Listbox.innerHTML += body;
    getCommentStatus(details.author, details.perm, `ratio-${details.perm}`).then((ratio) => {
      const rat = `<strong>${ratio[0]}</strong>`;
      document.getElementById(ratio[1]).innerHTML = rat;
    });
  }
  if (postlist.length > loadedAmount) {
    const moreButton = `<button class = 'moreButton' onclick = "loadDiscussions('${activeTab}', ${loadedAmount + PostPerLoad}, ${loadedAmount});this.style.display = 'none'">Load more</button>`;
    Listbox.innerHTML += moreButton;
  }
}
function openTab(evt, tabName) {
  const evnt = evt;
  /*
  Display a new tab when clicked
  Hide previous tab element and activate the new tab
  load the discussions again with new parameters
  */
  const tabcontent = document.getElementsByClassName('tabcontent');
  for (let i = 0; i < tabcontent.length; i += 1) {
    tabcontent[i].style.display = 'none';
    tabcontent[i].getElementsByClassName('discussionList')[0].innerHTML = 'loading...';
  } // Get all elements with class="tablinks" and remove the class "active"
  const tablinks = document.getElementsByClassName('tablinks');
  for (let i = 0; i < tablinks.length; i += 1) {
    tablinks[i].className = tablinks[i].className.replace(' active', '');
  } // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = 'block';
  evnt.currentTarget.className += ' active';
  activeTab = tabName;
  // eslint-disable-next-line no-use-before-define
  loadDiscussions(tabName);
}
function loadDiscussions(tab, shownAmount = PostPerLoad, previous = 0) {
  // Loads a list of posts according to the active tab
  if (tab === 'New') {
    steem.api.getDiscussionsByCreated({ limit: shownAmount + 1, tag: 'debato' }, (err, posts) => {
      console.log(posts);
      writeDiscussionList(posts, shownAmount, previous);
    });
  }
  if (tab === 'Trending') {
    steem.api.getDiscussionsByTrending({ limit: shownAmount + 1, tag: 'debato' }, (err, posts) => {
      writeDiscussionList(posts, shownAmount, previous);
    });
  }
}
