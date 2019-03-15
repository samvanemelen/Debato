/* eslint-disable no-unused-vars */
/* global updateLoginStatus getUrlVars timeSince getPostData
getCommentStatus createDiscussionCard showError :true */
let activeTab = '';
const URLvars = getUrlVars();
/*
If there is no user parsed as variable to look up
it wil redirect you back to the index page
*/
if (!('u' in URLvars)) {
  window.location.href = '/'; // If there are no variables parsed in URL, go to index
}
function openProfileTab(evt, tabName) {
  const event = evt;
  /*
  Display a new tab when clicked
  Hide previous tab element and activate the new tab
  */
  const tabcontent = document.getElementsByClassName('tabcontent');
  for (let i = 0; i < tabcontent.length; i += 1) {
    tabcontent[i].style.display = 'none';
  } // Get all elements with class="tablinks" and remove the class "active"
  const tablinks = document.getElementsByClassName('tablinks');
  for (let i = 0; i < tablinks.length; i += 1) {
    tablinks[i].className = tablinks[i].className.replace(' active', '');
  } // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = 'block';
  event.currentTarget.className += ' active';
  activeTab = tabName;
}
document.getElementById('defaultOpen').click();
const profileUsername = URLvars.u;

steem.api.getAccounts([profileUsername], (error, account) => {
  /*
  If the lenght of the account array is zero, no user was found with the given name
  In that case the profileCard will display 'could not find "user"'
  and stop all other code from running
  */
  const wrongUserText = `<div style="margin: 20px auto 20px auto; font-size: 1.5em;">Could not find "${profileUsername}"</div>`;
  if (account.length === 0) { document.getElementById('profileCard').innerHTML = wrongUserText; return; }
  const profileUser = account[0];
  // eslint-disable-next-line prefer-destructuring
  const name = profileUser.name;
  /*
  if the JSON does not containt information such as 'profile image' or 'about'
  it should skip the step until a default image is incorporated
  */
  let profileImage = JSON.parse(account[0].json_metadata).profile.profile_image;
  if (profileImage === undefined) { profileImage = ''; }
  const rawReputation = profileUser.reputation;
  let simpleReputation = 0;
  /*
  A raw reputation score of 0 would give negative infinity in the conventional formula
  to calculate reputation score.
  */
  if (rawReputation !== 0) { simpleReputation = (Math.log10(rawReputation) - 9) * 9 + 25; }
  const votingPower = profileUser.voting_power / 100;
  const createdDate = profileUser.created;
  const createdAge = timeSince(createdDate);
  // eslint-disable-next-line prefer-destructuring
  let about = JSON.parse(profileUser.json_metadata).profile.about;
  if (about === undefined) { about = ''; }
  document.getElementById('profileUsername').innerHTML = name;
  document.getElementById('profileImageLarge').style.backgroundImage = `url(${profileImage})`;
  document.getElementById('profileReputation').innerHTML = simpleReputation.toFixed(2);
  document.getElementById('votePowerBar').style.width = `calc(${votingPower}% - 0.5em)`;
  document.getElementById('votePowerBar').innerHTML = `${votingPower}%`;
  document.getElementById('activeFor').innerHTML = `Active for ${createdAge}`;
  document.getElementById('about').innerHTML = about;

  steem.api.getFollowCount(profileUsername, (err, result) => {
    const followers = result.follower_count;
    const following = result.following_count;
    document.getElementById('followers').innerHTML = `${followers} followers`;
    document.getElementById('following').innerHTML = `${following} following`;
  });
  /*
  To get the list of discussions posted by the author
  the maximum amount of posts are loaded (100) and filtered on the dag 'debato-discussion'
  These will then be displayed in the profile window
  */
  steem.api.getDiscussionsByAuthorBeforeDate(profileUsername, '', new Date(), 100, (err, result) => {
    const postlist = [];
    for (let i = 0; i < result.length; i += 1) {
    // eslint-disable-next-line prefer-destructuring
      const tags = JSON.parse(result[i].json_metadata).tags;
      if (tags !== undefined) {
        if (tags.indexOf('debato-discussion') > -1) {
          postlist.push(result[i]);
        }
      }
    }
    for (let i = 0; i < postlist.length; i += 1) {
      const cardHTML = createDiscussionCard(postlist[i]);
      const details = getPostData(postlist[i]);
      document.getElementById('authorDiscussions').innerHTML += cardHTML;
      getCommentStatus(details.author, details.perm, `ratio-${details.perm}`).then((ratio) => {
        const rat = `<strong>${ratio[0]}</strong>`;
        document.getElementById(ratio[1]).innerHTML = rat;
      });
    }
  });
  function getParentData(parentPost) {
    /*
    This function will be called when fetching comments placed by a user
    It will get the parent post to display 'Argumented on: parent title'
    */
    return new Promise(((resolve, reject) => {
      steem.api.getContent(parentPost.parent_author, parentPost.parent_permlink, (err, result) => {
        const details = getPostData(result);
        // eslint-disable-next-line prefer-destructuring
        const title = details.title;
        resolve({ title, author: result.author, perm: result.permlink });
      });
    }));
  }
  steem.api.getDiscussionsByComments({ start_author: profileUsername, limit: 100 },
    (err, comments) => {
      /*
      To get all comments posted by the user
      All comments are fetched and filtered on having a 'type' attribute in the custom JSON
      This attribute is used by debato to filter comments on pro, con, comment
      if it has this, the comment is placed via debato.org and should be displayed

      Loops through all comments (max 100) and stores the comment if it has the 'type' attribute
      Simultaneously it store the promise that fetches the parent post title
      */
      const commentList = [];
      const promiseList = [];
      for (let i = 0; i < comments.length; i += 1) {
        const postJSON = JSON.parse(comments[i].json_metadata);
        if ('type' in postJSON) {
          commentList.push(comments[i]);
          promiseList.push(getParentData(comments[i]));
        }
      }
      Promise.all(promiseList).then((argumentParents) => {
        let body = '';
        for (let i = 0; i < argumentParents.length; i += 1) {
          const postJSON = JSON.parse(comments[i].json_metadata);
          let postType = postJSON.type;
          if (postType === '') { postType = 'comment'; }
          const postDetails = getPostData(commentList[i]);
          // Creates a card that displays the comment, the parent title, reward and age
          body += '<div class="argumentCard">';
          body += `<p style="font-size: 0.9em; color: ">Argumented (${postType}) on: `;
          body += `<a href="/html/discussion?a=${argumentParents[i].author}&p=${argumentParents[i].perm}">${argumentParents[i].title}</a>`;
          body += ` by <a href="/html/profile?u=${argumentParents[i].author}">${argumentParents[i].author}</a></p>`;
          body += `<p style="font-size:1.2em;"><a class="blackLink" href = "/html/discussion?a=${postDetails.author}&p=${postDetails.perm}">${postDetails.title}</a></p>`;
          body += `<p title="${postDetails.created}">${postDetails.reward} - ${timeSince(postDetails.created)} ago</p>`;
          body += '</div>';
        }
        document.getElementById('authorComments').innerHTML = body;
      });
    });
});
