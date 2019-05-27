/* global getUrlVars:true */
/* eslint-disable no-unused-vars */
document.getElementById('Debato').click();

if ('t' in getUrlVars()) {
  try {
    const tab = getUrlVars().t;
    document.getElementById(tab).click();
  } catch (err) {
    // Just open the page if invalid tab was parsed
  }
}

function openTab(evt, tabName) {
  const event = evt;
  /*
  Display a new tab when clicked
  Hide previous tab element and activate the new tab
  load the discussions again with new parameters
  */
  const tabcontent = document.getElementsByClassName('tabcontent');
  for (let i = 0; i < tabcontent.length; i += 1) {
    tabcontent[i].style.display = 'none';
  }
  // Get all elements with class="tablinks" and remove the class "active"
  const tablinks = document.getElementsByClassName('tablinks');
  for (let i = 0; i < tablinks.length; i += 1) {
    tablinks[i].className = tablinks[i].className.replace(' active', '');
  }
  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = 'block';
  event.currentTarget.className += ' active';
}
function toggleNext(obj) {
  const button = obj;
  const nextEl = button.nextElementSibling;
  if (nextEl.style.display !== 'block') {
    nextEl.style.display = 'block';
    button.className += ' active';
  } else {
    nextEl.style.display = 'none';
    button.className = button.className.replace(' active', '');
  }
}
