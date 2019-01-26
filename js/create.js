/* eslint-disable no-undef */
updateLoginStatus();

// eslint-disable-next-line no-unused-vars
function publish() {
  if (user === '' || user === undefined) {
    // eslint-disable-next-line no-alert
    alert('Please log in before publishing a discussion');
    window.location.href = '/index';
  }
  // Publish a new discussion
  const title = document.getElementById('discussionTitle').value;
  const titleLow = title.toLowerCase();
  let body = document.getElementById('discussionBody').value;
  const tags = document.getElementById('discussionTags').value;
  const coverImage = document.getElementById('coverImage').value;
  if (title === '' || body === '' || tags === '' || coverImage === '') {
    // eslint-disable-next-line no-alert
    alert('Please make sure to fill in all fields');
    return;
  }
  for (let i = 0; i < tags.length; i += 1) {
    if (!'abcdefghijklmnopqrstuvwxyz- '.includes(tags.charAt(i))) {
      // eslint-disable-next-line no-alert
      alert('Your tags should be separated by spaces and consist only out of lowercase letters');
      return;
    }
  }
  document.getElementById('coverImage').disabled = true;
  document.getElementById('discussionTitle').disabled = true;
  document.getElementById('discussionBody').disabled = true;
  document.getElementById('discussionTags').disabled = true;
  document.getElementById('publishBtn').disabled = false;
  let perm = '';
  for (let i = 0; i < titleLow.length; i += 1) {
    if ('abcdefghijklmnopqrstuvwxyz-'.includes(titleLow.charAt(i))) {
      perm += titleLow.charAt(i);
    } else { perm += '-'; }
  }
  const taglist = tags.split(' ');
  let tagsMeta = `{"image":["${coverImage}"], "tags":["debato",`;
  for (let i = 0; i < taglist.length; i += 1) {
    tagsMeta += `"${taglist[i]}"`;
    if (i + 1 < taglist.length) { tagsMeta += ','; }
  }
  tagsMeta += `], "context":"${body}"`;
  tagsMeta += '}';
  body = `<center>${body} <br> To display the structured discussion or engage in the debate, view the topic on `;
  body += `<a href='www.debato.org/discussion?a=${user}&p=${perm}'>www.debato.org/discussion?a=${user}&p=${perm}</a>`;
  body += `<img src = '${coverImage}'/></center>`;
  let randomstr = '';
  const possible = '1234567890abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 5; i += 1) {
    randomstr += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  perm += randomstr;
  // eslint-disable-next-line no-console
  console.log('', 'debato', user, perm, title, body, JSON.parse(tagsMeta));
  api.comment('', 'debato', user, perm, title, body, JSON.parse(tagsMeta), (err, res) => {
    if (res) {
      window.location.href = `/discussion?a=${user}&p=${perm}`;
    } else {
      // eslint-disable-next-line no-alert
      alert('Could not publish the discussion. Please refresh the page or try again later');
      document.getElementById('coverImage').disabled = false;
      document.getElementById('discussionTitle').disabled = false;
      document.getElementById('discussionBody').disabled = false;
      document.getElementById('discussionTags').disabled = false;
      document.getElementById('publishBtn').disabled = false;
    }
    // eslint-disable-next-line no-console
    console.log(err, res);
  });
}
