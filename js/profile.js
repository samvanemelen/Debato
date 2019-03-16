/* eslint-disable no-unused-vars */
/* global updateLoginStatus getUrlVars timeSince getPostData
getCommentStatus createDiscussionCard showError :true */
let activeTab = '';
const URLvars = getUrlVars();
let viewingUser = '';
let SteemBalance = 0;
let SBDBalance = 0;
let VestBalance = 0;
let totalVests = 0;
let totalSteem = 0;
const delegatee = [];
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
function showInfo(element) {
  const infoBox = element.firstElementChild;
  if (infoBox.style.display === 'none') {
    infoBox.style.display = 'block';
  } else {
    infoBox.style.display = 'none';
  }
}
function openTransfer() {
  const fade = document.getElementById('TransactionFade');
  const transferBox = document.getElementById('TransferBox');
  fade.style.display = 'block';
  transferBox.style.display = 'block';

  if (viewingUser !== user) {
    document.getElementById('recipient').value = viewingUser;
  }
  document.getElementById('def_open').click();
  fade.addEventListener('click', (event) => {
    if (event.target === fade) {
      fade.style.display = 'none';
      transferBox.style.display = 'none';
    }
  });
}
function Transfer(recipient, amount, memo, currency) {
  document.getElementById('TransactionFade').style.display = 'none';
  document.getElementById('TransferBox').style.display = 'none';
  const url = api.sign('transfer', {
    from: user,
    to: recipient.replace('@', ''),
    amount: `${amount} ${currency}`,
    memo,
  }, window.href);
  const win = window.open(url, '_blank');
  win.focus();
}
function openPowerUp() {
  const fade = document.getElementById('TransactionFade');
  const powerupBox = document.getElementById('powerupBox');
  fade.style.display = 'block';
  powerupBox.style.display = 'block';
  powerupBox.getElementsByClassName('balance')[0].innerHTML = `${SteemBalance}`;
  fade.addEventListener('click', (event) => {
    if (event.target === fade) {
      fade.style.display = 'none';
      powerupBox.style.display = 'none';
    }
  });
}
function powerup(amount) {
  document.getElementById('TransactionFade').style.display = 'none';
  document.getElementById('powerupBox').style.display = 'none';
  const url = api.sign('transfer-to-vesting', {
    from: user,
    to: user,
    amount: `${amount} STEEM`,
  }, window.href);
  const win = window.open(url, '_blank');
  win.focus();
}
function openPowerDown() {
  const fade = document.getElementById('TransactionFade');
  const powerdownBox = document.getElementById('powerdownBox');
  fade.style.display = 'block';
  powerdownBox.style.display = 'block';
  const SP = (totalSteem * (VestBalance / totalVests)).toFixed(3);
  powerdownBox.getElementsByClassName('balance')[0].innerHTML = `${SP}`;
  fade.addEventListener('click', (event) => {
    if (event.target === fade) {
      fade.style.display = 'none';
      powerdownBox.style.display = 'none';
    }
  });
}
function powerdown(amount) {
  document.getElementById('TransactionFade').style.display = 'none';
  document.getElementById('powerdownBox').style.display = 'none';
  const vests = amount / totalSteem * totalVests;
  const url = api.sign('withdraw-vesting', {
    to: user,
    vesting_shares: `${vests} VESTS`,
  }, window.href);
  const win = window.open(url, '_blank');
  win.focus();
}
function openDelegate() {
  const fade = document.getElementById('TransactionFade');
  const delegateBox = document.getElementById('delegateBox');
  fade.style.display = 'block';
  delegateBox.style.display = 'block';
  const SP = (totalSteem * (VestBalance / totalVests)).toFixed(3);
  delegateBox.getElementsByClassName('balance')[0].innerHTML = `${SP}`;
  fade.addEventListener('click', (event) => {
    if (event.target === fade) {
      fade.style.display = 'none';
      delegateBox.style.display = 'none';
    }
  });
}
function delegate(amount) {
  document.getElementById('TransactionFade').style.display = 'none';
  document.getElementById('delegateBox').style.display = 'none';
  const vests = amount / totalSteem * totalVests;
  const url = api.sign('delegate-vesting-shares', {
    delegator: user,
    delegatee: viewingUser,
    vesting_shares: `${vests.toFixed(3)} VESTS`,
  }, window.href);
  const win = window.open(url, '_blank');
  win.focus();
}
function openRemoveDelegation() {
  const fade = document.getElementById('TransactionFade');
  const removeDelegationBox = document.getElementById('removeDelegationBox');
  fade.style.display = 'block';
  removeDelegationBox.style.display = 'block';
  const SP = (totalSteem * (VestBalance / totalVests)).toFixed(3);
  fade.addEventListener('click', (event) => {
    if (event.target === fade) {
      fade.style.display = 'none';
      removeDelegationBox.style.display = 'none';
    }
  });
}
function removedelegation(amount) {
  document.getElementById('TransactionFade').style.display = 'none';
  document.getElementById('delegateBox').style.display = 'none';
  const vests = amount / totalSteem * totalVests;
  const url = api.sign('delegate-vesting-shares', {
    delegator: user,
    delegatee: viewingUser,
    vesting_shares: '0 VESTS',
  }, window.href);
  const win = window.open(url, '_blank');
  win.focus();
}
function switchCurrency(element) {
  const transferBox = document.getElementById('TransferBox');
  if (element.innerHTML === 'SBD') {
    transferBox.getElementsByClassName('balance')[0].innerHTML = `${SBDBalance}`;
  } else {
    transferBox.getElementsByClassName('balance')[0].innerHTML = `${SteemBalance}`;
  }
  if (element.classList.contains('active')) { return; }
  const CurrButtonList = document.getElementsByClassName('CurrButton');
  for (let i = 0; i < CurrButtonList.length; i += 1) {
    CurrButtonList[i].classList.toggle('active');
  }
}
document.getElementById('defaultOpen').click();
const profileUsername = URLvars.u;

steem.api.getAccounts([profileUsername, user], (error, account) => {
  /*
  If the lenght of the account array is zero, no user was found with the given name
  In that case the profileCard will display 'could not find "user"'
  and stop all other code from running
  */
  const wrongUserText = `<div style="margin: 20px auto 20px auto; font-size: 1.5em;">Could not find "${profileUsername}"</div>`;
  if (account.length === 0) { document.getElementById('profileCard').innerHTML = wrongUserText; return; }
  const profileUser = account[0];
  console.log(profileUser);
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

  let votingPower = 100;
  if (profileUser.voting_power !== 0) { votingPower = profileUser.voting_power / 100; }
  // eslint-disable-next-line prefer-destructuring
  let about = JSON.parse(profileUser.json_metadata).profile.about;
  if (about === undefined) { about = ''; }
  viewingUser = profileUser.name;
  document.getElementById('profileUsername').innerHTML = profileUser.name;
  document.getElementById('profileImageLarge').style.backgroundImage = `url(${profileImage})`;
  document.getElementById('profileReputation').innerHTML = simpleReputation.toFixed(2);
  document.getElementById('votePowerBar').style.width = `calc(${votingPower}% - 0.5em)`;
  document.getElementById('votePowerBar').innerHTML = `${votingPower}%`;
  document.getElementById('activeFor').innerHTML = `Active for ${timeSince(profileUser.created)}`;
  document.getElementById('about').innerHTML = about;

  steem.api.getFollowCount(profileUsername, (err, result) => {
    const followers = result.follower_count;
    const following = result.following_count;
    document.getElementById('followers').innerHTML = `${followers} followers`;
    document.getElementById('following').innerHTML = `${following} following`;
  });

  // Wallet:
  document.getElementById('SteemTokens').innerHTML = profileUser.balance;
  document.getElementById('SteemBackedDollars').innerHTML = profileUser.sbd_balance;
  document.getElementById('SavingsSteem').innerHTML = profileUser.savings_balance;
  document.getElementById('SavingsSBD').innerHTML = profileUser.savings_sbd_balance;
  SteemBalance = parseFloat(profileUser.balance.split(' ')[0]);
  SBDBalance = parseFloat(profileUser.sbd_balance.split(' ')[0]);
  VestBalance = parseFloat(profileUser.vesting_shares.split(' ')[0]);
  // Calculating Steem Power
  steem.api.getDynamicGlobalProperties((err, result) => {
    [totalSteem] = result.total_vesting_fund_steem.split(' ');
    [totalVests] = result.total_vesting_shares.split(' ');
    [VestBalance] = account[1].vesting_shares.split(' ');

    const profileSP = totalSteem * (profileUser.vesting_shares.split(' ')[0] / totalVests);
    document.getElementById('SteemPower').innerHTML = `${profileSP.toFixed(3)} SP`;
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
        let discussionList = '';
        for (let i = 0; i < argumentParents.length; i += 1) {
          const postJSON = JSON.parse(comments[i].json_metadata);
          let postType = postJSON.type;
          if (postType === '') { postType = 'comment'; }
          const postDetails = getPostData(commentList[i]);
          // Creates a card that displays the comment, the parent title, reward and age
          discussionList += createDiscussionCard(comments[i]);
        }
        document.getElementById('authorComments').innerHTML = discussionList;
      });
    });
  // When you view an account, your delegatee list is loaded to check if the user is in it.
  steem.api.getVestingDelegations('samve', '', 100, (err, result) => {
    for (let i = 0; i < result.length; i += 1) {
      delegatee.push(result[i].delegatee);
    }

    // Disable or enable certain wallet transactions when a user is not on his own profile
    if (user === profileUser.name) {
      const ownProfileOnlyList = document.getElementsByClassName('onOwnAccount');
      for (let i = 0; i < ownProfileOnlyList.length; i += 1) {
        ownProfileOnlyList[i].style.display = 'table-row';
      }
    } else {
      const otherOnlyList = document.getElementsByClassName('onOtherAccount');
      for (let i = 0; i < otherOnlyList.length; i += 1) {
        otherOnlyList[i].style.display = 'table-row';
      }
      // If you have not delegated to the account, the option to remove delegation should be hidden.
      if (!delegatee.includes(profileUser.name)) {
        document.getElementById('removeDelegation').style.display = 'none';
      }
    }
  });
});
