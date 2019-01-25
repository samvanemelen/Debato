var activeTab = ""

if (currentURL.includes("access_token")){
	var vars = getUrlVars();
	accessToken = vars["access_token"]
	expiresIn = vars["expires_in"]
	user = vars["username"]
	var expiresOn = new Date()
	expiresOn.setSeconds(expiresOn.getSeconds() + parseInt(expiresIn))
	document.cookie = "username=" + user + ";expires="+expiresOn+";"
	document.cookie = "accessToken=" + accessToken + ";expires=" + expiresOn + ";"
	document.cookie = "weight=" + weightSlider.value + ";"
}

updateLoginStatus();

document.getElementById("defaultOpen").click();

function openTab(evt, tabName) {
	//Display a new tab when clicked
	closeDropDown(activePerm);
	var tabcontent = document.getElementsByClassName("tabcontent");
	for (var i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
		tabcontent[i].getElementsByClassName("discussionList")[0].innerHTML = "loading..."
	} // Get all elements with class="tablinks" and remove the class "active"
	var tablinks = document.getElementsByClassName("tablinks");
	for (var i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	} // Show the current tab, and add an "active" class to the button that opened the tab
	document.getElementById(tabName).style.display = "block";
	evt.currentTarget.className += " active";
	activeTab = tabName;
	loadDiscussions(tabName);
}
function writeDiscussionList(postlist, amount, previous){
	//Loads a list of discussions on the front page when a tab is opened
	Listbox = document.getElementById(activeTab).getElementsByClassName("discussionList")[0];
	if (amount == 5){Listbox.innerHTML = ""}
	if (postlist.length < amount){amount = postlist.length}
	for (var i = previous; i < amount; i++){
		var body = ""
		var details = getPostData(postlist[i])
		body += "<div class = \"discussionObj\" id = \""+details.perm+"\"><button class=\"ObjLink\" onclick=\"writeDropDown(event, \'"+details.author+"\',\'"+details.perm+"\')\">"
		if (details.thumbnail == false || details.thumbnail == ""){
			body += "<div class = \"thumbnail\" style = \"background-image:none\"></div>"
		}
		else {
			body += "<div class = \"thumbnail\" style = \"background-image:url(\'" + details.thumbnail + "\')\"></div>"
		}
		body += "<h2 style='display:inline-block'>"+ details.title + "</h2><p class='ratio' id='ratio-"+details.perm+"' style='font-weight: bold;'></p></button>"
		body += "<div class = \"discussionBody\"></div>"
		body += "</div><hr>"
		Listbox.innerHTML += body;
		getCommentStatus(details.author, details.perm, "ratio-"+details.perm).then(function(ratio){document.getElementById(ratio[1]).innerHTML = ratio[0];})
	}
	if (postlist.length > amount){
		var moreButton = "<button class = 'moreButton' onclick = \"loadDiscussions('" + activeTab + "', "+ (amount+5) +", "+ (amount) +");this.style.display = 'none'\">Load more</button>"
		Listbox.innerHTML += moreButton;
	}
}
function loadDiscussions(tab, amount = 5, previous = 0){
	//Select which parameters are needed for showing the discussion list on the frontpage
	if (tab == "New"){
		steem.api.getDiscussionsByCreated({"limit": amount+1, "tag" : "debato"}, function(err, posts) {
			writeDiscussionList(posts, amount, previous);
		});
	};
	if (tab == "Trending"){
		steem.api.getDiscussionsByTrending({"limit": amount+1, "tag" : "debato"}, function(err, posts) {
			writeDiscussionList(posts, amount, previous);
		});
	};
}
