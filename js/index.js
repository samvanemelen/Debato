/* global updateLoginStatus getUrlVars getPostData getCommentStatus:true */
/* eslint-disable no-unused-vars */
let activeTab = '';
let activeTag = '';
let expiresIn = '';
const taglist = ['sport', 'politics', 'science', 'ethics'];
const PostPerLoad = 6;
const currentURL = window.location.href;
const URLvars = getUrlVars();

if ('access_token' in URLvars) {
  accessToken = URLvars.access_token;
  expiresIn = URLvars.expires_in;
  user = URLvars.username;
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
  if (postlist.length === 0) { Listbox.innerHTML = '<strong>Could not find any discussions with those tags.<strong>'; return; }
  if (loadedAmount === PostPerLoad || loadedAmount === 99) { Listbox.innerHTML = ''; }
  // The first amount of posts is loaded or all possible items are loaded, so reset Listbox
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
function loadDiscussions(tab, shownAmount = PostPerLoad, previous = 0, tag = '') {
  /*
  The first part of the function deals with activating a tag to filter posts
  If the clicked tag equals the active tag it should be disabled. (activeTag = '')
  If clicked tag was not active already, the active tag should be the new tag

  Then tag suggestions are shown, if the filtered tag is not in the suggestions,
  it is temporarily added to show the filtered tag.
  */
  if (tag === activeTag) { activeTag = ''; } else if (tag !== '') { activeTag = tag; }
  if (taglist.indexOf(activeTag) < 0 && activeTag !== '') { taglist.push(activeTag); }
  let tagSugBody = '';
  let tagClass = 'tag';
  for (let i = 0; i < taglist.length; i += 1) {
    if (activeTag === taglist[i]) { tagClass = 'tag active'; } else { tagClass = 'tag'; }
    tagSugBody += `<p class = "${tagClass}" onclick="loadDiscussions('${tab}',99 ,0 ,'${taglist[i]}')">${taglist[i]}</p>`;
  }
  tagSugBody += '<input id = "tagSearchBar" placeholder="search">';
  document.getElementById('tagSuggestions').innerHTML = tagSugBody;
  /*
  Add event listener for any keypress in the tag search bar
  If any button is pressed, the width should update to the present content
  This width is determined by a hidden span element on the page
  The value of the input is placed in the span and scrollwidth is calculated
  */
  document.getElementById('tagSearchBar').addEventListener('keyup', (event) => {
    const SearchTag = document.getElementById('tagSearchBar');
    const ruler = document.getElementById('ruler');
    ruler.innerHTML = SearchTag.value;
    SearchTag.style.width = ruler.scrollWidth + 20;
    // When enter is pressed, perform a search for that tag
    if (event.keyCode === 13) {
      loadDiscussions(activeTab, 99, 0, SearchTag.value);
    }
  });
  /*
  The filterPosts function will take a postlist and filter on posts which have
  the filtertag in their metadata. These posts are returned as a list
  */
  function filterPosts(postlist, filtertag) {
    const returnlist = [];
    for (let i = 0; i < postlist.length; i += 1) {
      if (getPostData(postlist[i]).tags.indexOf(filtertag) >= 0) {
        returnlist.push(postlist[i]);
      }
    }
    return returnlist;
  }
  /*
  If a tag was parsed to the function, it should write the discussionlist
  with the filtered results. If not, the entire postlist is used
  */
  if (tab === 'New') {
    steem.api.getDiscussionsByCreated({ limit: shownAmount + 1, tag: 'debato-discussion' }, (err, posts) => {
      let postlist = [];
      if (activeTag !== '') { postlist = filterPosts(posts, activeTag); } else { postlist = posts; }
      writeDiscussionList(postlist, shownAmount, previous);
    });
  }
  if (tab === 'Trending') {
    steem.api.getDiscussionsByTrending({ limit: shownAmount + 1, tag: 'debato-discussion' }, (err, posts) => {
      let postlist = [];
      if (activeTag !== '') { postlist = filterPosts(posts, activeTag); } else { postlist = posts; }
      writeDiscussionList(filterPosts(posts, tag), shownAmount, previous);
    });
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
  // eslint-disable-next-line no-restricted-globals
  if ('tag' in getUrlVars()) { activeTag = getUrlVars().tag; history.pushState({}, document.title, '/'); }
  loadDiscussions(tabName);
}
