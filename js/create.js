/* global updateLoginStatus getUrlVars getPostData showWarning parseHtml showError:true */
let perm = '';
updateLoginStatus();
/*
If a permlink is present in the URL it should set up the page for editing a post
the post is fetched and the values are filled in in the input sections
*/
if ('p' in getUrlVars()) {
  steem.api.getContent(user, getUrlVars().p, (err, post) => {
    const info = getPostData(post);
    // title, thumbnail, description, author, perm, reward,
    document.getElementById('discussionTitle').value = info.title;
    document.getElementById('discussionContext').value = info.description;
    // eslint-disable-next-line prefer-destructuring
    perm = info.perm;
    document.getElementById('coverImage').value = info.thumbnail;
    document.getElementById('coverPreview').src = info.thumbnail;
    document.getElementById('discussionTags').value = info.tags.slice(1, info.tags.length).join(' ');
  });
}
// Update a preview of what the context will look like after parsing Markdown
document.getElementById('discussionContext').addEventListener('keyup', () => {
  const previewElement = document.getElementsByClassName('previewElement')[0];
  const contextValue = document.getElementById('discussionContext').value;
  previewElement.innerHTML = converter.makeHtml(parseHtml(contextValue));
});
// Display a warning when a user types an unsupported character in the tags section
document.getElementById('discussionTags').addEventListener('keyup', (event) => {
  const tags = event.target.value;
  for (let i = 0; i < tags.length; i += 1) {
    if (!'abcdefghijklmnopqrstuvwxyz- '.includes(tags.charAt(i))) {
      document.getElementById('tagWarning').style.display = 'block';
      return;
    }
  }
  document.getElementById('tagWarning').style.display = 'none';
});
// eslint-disable-next-line no-unused-vars
function publish() {
  if (user === '' || user === undefined) {
    // eslint-disable-next-line no-alert
    alert('Please log in before publishing a discussion');
    window.location.href = '/index';
  }
  /*
  This function gets the user's input. When all fields are filled in
  it will disable all input elements while publishing.
  */
  const title = document.getElementById('discussionTitle').value;
  const titleLow = title.toLowerCase();
  const context = document.getElementById('discussionContext').value;
  const parsedContext = parseHtml(context);
  const tags = document.getElementById('discussionTags').value;
  const coverImage = document.getElementById('coverImage').value;
  if (title === '' || context === '' || tags === '' || coverImage === '') {
    showWarning('Please make sure to fill in all fields');
    return;
  }
  for (let i = 0; i < tags.length; i += 1) {
    if (!'abcdefghijklmnopqrstuvwxyz- '.includes(tags.charAt(i))) {
      showWarning('Your tags should be separated by spaces and consist only out of lowercase letters');
      return;
    }
  }
  document.getElementById('coverImage').disabled = true;
  document.getElementById('discussionTitle').disabled = true;
  document.getElementById('discussionContext').disabled = true;
  document.getElementById('discussionTags').disabled = true;
  document.getElementById('publishBtn').disabled = false;
  /*
  A permlink can only contain lower case letters and hyphens can be used
  Loop through all characters and when anything else is found
  it should be replaced with a hyphen
  */
  if (perm === '') {
    for (let i = 0; i < titleLow.length; i += 1) {
      if ('abcdefghijklmnopqrstuvwxyz-'.includes(titleLow.charAt(i))) {
        perm += titleLow.charAt(i);
      } else { perm += '-'; }
    }
    let randomstr = '';
    const possible = '1234567890abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < 5; i += 1) {
      randomstr += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    perm += randomstr;
  }
  const taglist = tags.split(' ');
  /*
  New discussions are tagged with "debato-discussion". This tag is used by the platform
  to filter actual discussions from posts about debato in general
  */
  let tagsMeta = `{"image":["${coverImage}"], "tags":["debato-discussion",`;
  for (let i = 0; i < taglist.length; i += 1) {
    tagsMeta += `"${taglist[i]}"`;
    if (i + 1 < taglist.length) { tagsMeta += ','; }
  }
  /*
  The discussion context is stored in the custom JSON metadata,
  The body of the post will be used to redirect readers from other platforms
  to debato where the discussions structure can be found.
  */
  const JsonParsedContext = parsedContext.replace(/(\r\n|\n|\r)/gm, '\\n'); // Remove line breaks for storing in JSON
  tagsMeta += `], "context":"${JsonParsedContext}"`;
  tagsMeta += '}';
  let body = '<center><p>To display the structured discussion or engage in the debate, view the topic on ';
  body += `<a href='debato.org/html/discussion?a=${user}&p=${perm}'>https://debato.org/html/discussion?a=${user}&p=${perm}</a></p>`;
  body += `<div>${parsedContext}</div><p><img src = '${coverImage}'/></p></center>`;
  api.comment('', 'debato', user, perm, title, body, JSON.parse(tagsMeta), (err, res) => {
    if (res) {
      window.location.href = `/html/discussion?a=${user}&p=${perm}`;
    } else {
      showError('Could not publish the discussion. Please refresh the page or try again later. If the issue persists, please contact a developer');
      document.getElementById('coverImage').disabled = false;
      document.getElementById('discussionTitle').disabled = false;
      document.getElementById('discussionContext').disabled = false;
      document.getElementById('discussionTags').disabled = false;
      document.getElementById('publishBtn').disabled = false;
    }
  });
}
