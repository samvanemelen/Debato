/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
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
  expiresOn.setSeconds(expiresOn.getSeconds() + parseInt(expiresIn, 10));
  document.cookie = `username=${user};expires=${expiresOn};`;
  document.cookie = `accessToken=${accessToken};expires=${expiresOn};`;
  document.cookie = `weight=${weightSlider.value};`;
}
updateLoginStatus();
document.getElementById('defaultOpen').click();
function writeDiscussionList(postlist, amount, previous) {
  /*
  Loads a list of discussion according to the provided postlist and amount
  Returns the html objects that make up the cards on the index page
  */
  const Listbox = document.getElementById(activeTab).getElementsByClassName('discussionList')[0];
  if (amount === PostPerLoad) { Listbox.innerHTML = ''; }
  if (postlist.length < amount) { amount = postlist.length; }
  for (let i = previous; i < amount; i += 1) {
    let body = '';
    const details = getPostData(postlist[i]);
    body += `<div class = "discussionObj" id = "${details.perm}"><button class="ObjLink" onclick="window.location.href='/html/discussion?a=${details.author}&p=${details.perm}'">`;
    if (details.thumbnail === false || details.thumbnail === '') {
      body += `<div class = "thumbnail" style = "background-image:none"><div class="ratio box" id='ratio-${details.perm}'></div></div>`;
    } else {
      body += `<div class = "thumbnail" style = "background-image:url('${details.thumbnail}')"><div class="ratio box" id='ratio-${details.perm}'></div></div>`;
    }
    body += `<h2 style='display:inline-block'>${details.title}</h2>`;
    body += '<div class = "discussionBody"></div>';
    body += '</div>';
    Listbox.innerHTML += body;
    getCommentStatus(details.author, details.perm, `ratio-${details.perm}`).then((ratio) => {
      const rat = `<strong>${ratio[0]}</strong>`;
      document.getElementById(ratio[1]).innerHTML = rat;
    });
  }
  if (postlist.length > amount) {
    const moreButton = `<button class = 'moreButton' onclick = "loadDiscussions('${activeTab}', ${amount + PostPerLoad}, ${amount});this.style.display = 'none'">Load more</button>`;
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
  closeDropDown(activePerm);
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
function loadDiscussions(tab, amount = PostPerLoad, previous = 0) {
  // Loads a list of posts according to the active tab
  if (tab === 'New') {
    steem.api.getDiscussionsByCreated({ limit: amount + 1, tag: 'debato' }, (err, posts) => {
      writeDiscussionList(posts, amount, previous);
    });
  }
  if (tab === 'Trending') {
    steem.api.getDiscussionsByTrending({ limit: amount + 1, tag: 'debato' }, (err, posts) => {
      writeDiscussionList(posts, amount, previous);
    });
  }
}
