/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
let activeTab = '';
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
  // Loads a list of discussions on the front page when a tab is opened
  const Listbox = document.getElementById(activeTab).getElementsByClassName('discussionList')[0];
  if (amount === 5) { Listbox.innerHTML = ''; }
  if (postlist.length < amount) { amount = postlist.length; }
  for (let i = previous; i < amount; i += 1) {
    let body = '';
    const details = getPostData(postlist[i]);
    body += `<div class = "discussionObj" id = "${details.perm}"><button class="ObjLink" onclick="writeDropDown(event, '${details.author}','${details.perm}')">`;
    if (details.thumbnail === false || details.thumbnail === '') {
      body += '<div class = "thumbnail" style = "background-image:none"></div>';
    } else {
      body += `<div class = "thumbnail" style = "background-image:url('${details.thumbnail}')"></div>`;
    }
    body += `<h2 style='display:inline-block'>${details.title}</h2>`;
    body += `<p class='ratio' id='ratio-${details.perm}' style='font-weight: bold;'></p></button>`;
    body += '<div class = "discussionBody"></div>';
    body += '</div><hr>';
    Listbox.innerHTML += body;
    getCommentStatus(details.author, details.perm, `ratio-${details.perm}`).then((ratio) => {
      const rat = ratio[0];
      document.getElementById(ratio[1]).innerHTML = rat;
    });
  }
  if (postlist.length > amount) {
    const moreButton = `<button class = 'moreButton' onclick = "loadDiscussions('${activeTab}', ${amount + 5}, ${amount});this.style.display = 'none'">Load more</button>`;
    Listbox.innerHTML += moreButton;
  }
}
function openTab(evt, tabName) {
  const evnt = evt;
  // Display a new tab when clicked
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
function loadDiscussions(tab, amount = 5, previous = 0) {
  // Select which parameters are needed for showing the discussion list on the frontpage
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
