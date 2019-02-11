/* global updateLoginStatus getUrlVars writeDropDown :true */

/*
First permlink and author are retrieved from the URL
If not available, user is sent to index page
Then the code is similar to the writeDropDown function
but modified to fit the new page since there is no
button to drop down from
*/
updateLoginStatus();
const URLvars = getUrlVars();
if (!('p' in URLvars) || !('a' in URLvars)) {
  window.location.href = '/'; // If there are no variables parsed in URL, go to index
}
const perm = URLvars.p;
const author = URLvars.a;
writeDropDown(author, perm);
