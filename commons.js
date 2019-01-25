var accessToken = "", expiresIn = "", user = "", activeAuthor = "", activePerm = "", readingAuthor = "", readingPerm = "", cookie = "";
var parentAuthor = "none", parentPerm = "none";
var weightSlider = document.getElementById("voteSlider")
var weight = 10000
var currentURL = window.location.href
var api
try{
	var cookieresult = document.cookie.split(";");
	user = cookieresult[0].split("=")[1];
	accessToken = cookieresult[1].split("=")[1];
	weight = parseInt(cookieresult[2].split("=")[1]);
	weightSlider.value = weight;
	document.getElementById("voteIndicator").innerHTML = weightSlider.value/100 + "% upvotes"
}
catch(err){console.log(err)}

weightSlider.oninput = function(){
	//When the weight slider changes, change the cookie and change the indicator
	weight = this.value
	document.getElementById("voteIndicator").innerHTML = this.value/100 + "% upvotes"
	document.cookie = "weight=" + weight + ";"
}
function toggleMenu(show){
	//Toggle the account menu on hover. Called in HTML onmouseover and onmouseleave
	var accountMenu = document.getElementById("accountMenu")
	if (user != "" && user != undefined){
		if (show){accountMenu.style.maxHeight = "200px"} 
		else{accountMenu.style.maxHeight = "0";}
	}
}
function updateLoginStatus(){
	//When the page loads, get cookie data, display profile info and set variables
	try {
		try{
			var cookieresult = document.cookie.split(";");
			user = cookieresult[0].split("=")[1];
			accessToken = cookieresult[1].split("=")[1];
			weight = parseInt(cookieresult[2].split("=")[1]);
			weightSlider.value = weight/100;
			document.getElementById("voteIndicator").innerHTML = weightSlider.value + "% upvotes"
		} catch(err){console.log(err)}

		if (accessToken != ""){
			steem.api.getAccounts([user], function(err, result){
				var name = user;
				console.log("welcome " + name + "!")
				var profileImage = JSON.parse(result[0].json_metadata).profile.profile_image;
				var body = "<div id = \"profileImage\" style=\"background-image:url("+profileImage+"); display:inline-block;\"></div><p style=\"color:#000000; font-size:22px\"><strong>" + name + "</strong></p>"
				document.getElementById("accountLogin").innerHTML = body;
				document.getElementById("accountBox").style.backgroundColor = "none";
				api = sc2.Initialize({
					app: 'debato-app',
					callbackURL: 'http://www.debato.org',
					accessToken: accessToken,
					scope: ['vote', 'comment', 'delete_comment']
				});
			})
		} else {
			var link = "<a href = \"https://steemconnect.com/oauth2/authorize?client_id=debato-app&redirect_uri=http://www.debato.org&scope=vote,comment,delete_comment\"><div id = \"SteemConnect\">Log in</div></a>"
			document.getElementById("accountLogin").innerHTML = link
		}
	} catch(error){accessToken = ""}
}
function getUrlVars() {
	//Get the variables passed in the URL
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		vars[key] = value;
	});
	return vars;
}
function logout(){
	//Revoke the active token and return to the home page
	console.log("logging out")
	document.cookie = "username="+user+";expires=expires=Thu, 01 Jan 1970 00:00:01 GMT;"
	document.cookie = "accessToken="+accessToken+";expires=expires=Thu, 01 Jan 1970 00:00:01 GMT;"
	document.cookie = "weight="+weight+";expires=expires=Thu, 01 Jan 1970 00:00:01 GMT;"
	user = ""
	accessToken	= ""
	expiresIn = ""
	api.revokeToken(function (err, res) {
		console.log("revoked")
		console.log(err, res)
		window.location.href = 'index.html';
	});
}
function upvote(obj, author, perm){
	//Upvote a post and change the settings of the upvote button
	if (obj.children.length > 0){
		obj.children[0].style.backgroundColor = "black";
	}
	api.vote(user, author, perm, weight, function(err, res){
		if (res){
			obj.setAttribute('onclick', 'removeVote(this, \''+author+'\', \''+perm+'\')')
			if (obj.children.length > 0){
				obj.style.backgroundColor = "#3b9954";
			} else {
				obj.style.borderBottom = "25px solid #3b9954"
			}
		} else {
			alert("Could not broadcast vote. Please refresh the page and try again")
		}
		if (obj.children.length > 0){
			obj.children[0].style.backgroundColor = "inherit";
			obj.previousElementSibling.innerHTML = parseInt(obj.previousElementSibling.innerHTML) + 1
		}
	})
}
function removeVote(obj, author, perm){
	//Set an upvote value to 0 and change the settings of the button
	if (obj.children.length > 0){
		obj.children[0].style.backgroundColor = "black";
	}
	api.vote(user, author, perm, 0, function(err, res){
		if (res){
			obj.setAttribute('onclick', 'upvote(this, \''+author+'\', \''+perm+'\')')
			if (obj.children.length > 0){
				obj.style.backgroundColor = "#3b9954";
			} else {
				obj.style.borderBottom = "25px solid #ccc"
			}
		} else {
			alert("Could not remove vote. Please refresh the page and try again")
		}
		if (obj.children.length > 0){
			obj.children[0].style.backgroundColor = "inherit";
			if (parseInt(obj.previousElementSibling.innerHTML)>0){
				obj.previousElementSibling.innerHTML = parseInt(obj.previousElementSibling.innerHTML) - 1
			}
		}
	})
}
function comment(textbox, commenttype){
	//Comment on an argument with neccesairy JSON if required	
	textbox.disabled = true;
	textbox.nextElementSibling.disabled = true;
	var prefix = "";
	var body = textbox.value;
	var randomstr = "";
	var possible = "1234567890abcdefghijklmnopqrstuvwxyz-";
	for (var i = 0; i < 5; i++){randomstr += possible.charAt(Math.floor(Math.random() * possible.length))}
		var newPerm = readingPerm+randomstr
	switch(commenttype){
		case "com": type = ""; break;
		case "con": type = "con"; break;
		case "pro": type = "pro"; break;
	}
	api.comment(readingAuthor, readingPerm, user, newPerm, "", body, JSON.parse('{"type":"'+type+'"}'), function (err, res) {
		console.log(err, res);
		textbox.disabled = false;
		textbox.nextElementSibling.disabled = false;
		if (!res){alert("Could not post your comment. Please refresh the page and try again"); return}
		textbox.value = "";
		var newArg = ""
		if (commenttype == "com"){
			newArg = "<p id = de-"+newPerm+"><strong>" + user + "</strong> - " + body
			newArg += "<a class = \"removeButton\" onclick = \"deleteComment(\'"+user+"\',\'"+newPerm+"\')\">    remove</a></p>"
		} else {
			newArg = "<h3 id = de-"+newPerm+"><p class='voteCounter'>0</p>"
			newArg += "<div class = \"relevantButton\" onclick=\"upvote(this, \'" + user + "\',\'" + newPerm + "\')\"><div></div></div>"
			newArg += "<a class=\"commentLink\" onclick=\"writeDropDown(event,\'" + user + "\', \'" + newPerm + "\')\"> " + body + "</a>"
			newArg += "<a class = \"removeButton\" onclick = \"deleteComment(\'"+ user +"\',\'"+ newPerm +"\')\">    remove</a>"
		}
		document.getElementsByClassName(commenttype)[0].innerHTML += newArg;
	});
}
function deleteComment(author, perm){
	//Remove a comment and take it out of the list
	api.deleteComment(author, perm, function(err, res){
		if (!res){alert("Could not remove your comment. Please refresh the page and try again"); return}
		document.getElementById("de-"+perm).style.display = "none";
	})
}
function showCommentBox(buttonObj){
	//Displays the text area for typing a new comment
	var commentobj = buttonObj.parentElement.parentElement;
	var textbox = buttonObj.nextElementSibling;
	if (textbox.style.display == "none" || textbox.style.display == ""){
		textbox.style.display = "block"
		if (commentobj.style.overflow != ("scroll")){commentobj.style.maxHeight = "none"}
	} else {textbox.style.display = "none"}
openDropDown(activePerm, textbox.scrollHeight)
if (commentobj.style.maxHeight != "500px" && buttonObj.parentElement.className != "statementBox"){
	commentsDropDown(buttonObj)
}
}
function commentsDropDown(obj){
	//Display the comment section of a certain discussion
	if (obj.className.indexOf("comments") != -1){var content = obj.nextElementSibling} 
		else {var content = obj.parentElement.parentElement.firstElementChild.nextElementSibling;}

	if (content.style.maxHeight && (content.style.maxHeight == (content.scrollHeight+'px') || content.style.maxHeight == "500px")){
		content.style.maxHeight = null;
		content.style.borderStyle = "none";

	} else {
		if (content.scrollHeight > 500){content.style.maxHeight = "500px"; content.style.overflow = "scroll"}
		else {content.style.maxHeight = content.scrollHeight + "px";}
	}
	openDropDown(activePerm, content.scrollHeight)
}
function closeDropDown(perm){
	//Closes an opened discussion on the home page
	if (perm == ""){return;}
	elements = document.getElementsByClassName("discussionBody");
	for (var i = 0; i < elements.length; i++){
		elements[i].style.maxHeight = null;
	}
	parentAuthor = "none";
	parentPerm = "none";
	activePerm = ""
	activeAuthor = ""
}
function openDropDown(perm, extra = 0){
	//Opens a selected discussion on the home page
	element = document.getElementById(perm).getElementsByClassName("discussionBody")[0];
	element.style.maxHeight = "none"
	element.style.height = "auto"
}
function getPostData(postobj){
	//Get data of a post for later use
	try{var thumbnail = JSON.parse(postobj.json_metadata).image[0];}
	catch(error) {var thumbnail = false;}
	var author = postobj.author;
	var title = postobj.title;
	var description = ""
	try{var description = JSON.parse(postobj.json_metadata).context;}
	if (title == ""){
		title = postobj.body
		description = "";
	}
	var reward = postobj.pending_payout_value;
	var perm = postobj.permlink;
	return {"title": title, "thumbnail": thumbnail, "description": description, "author": author, "perm": perm, "reward": reward}
}
function getPostArguments(author, perm){
	//Gets all comments on an argument and filters it according to argument type (comment/pro/con) and sorts it if needed
	return new Promise(function(resolve, reject){
		var pro = [];
		var con = [];
		var com = [];
		steem.api.getContentReplies(author, perm, function(err, comments) {
			for (var i = 0; i < comments.length; i++){
				try{
					var type = JSON.parse(comments[i].json_metadata).type;
					if (type == "pro"){
						pro.push(comments[i]);
					}
					else if (type == "con"){
						con.push(comments[i]);
					}
					else{
						com.push(comments[i]);
					}
				}
				catch(error){com.push(comments[i]);}
			}
			resolve({"pro":pro, "con":con, "com": com})
		})
	});
}
function checkForParent(author, perm){
	//Check if the post has a parent post (and what is the parent discussion)
	return new Promise(function(resolve, reject){
		steem.api.getContent(author, perm, function(err, post) {
			if(post.parent_author == ""){resolve([false])}
			else {resolve([true, post.parent_author, post.parent_permlink])}
		})
	})
}
function getVoteStatus(comment){
	//Does the argument has been upvoted by the user already and counts the total amount of upvotes
	return new Promise(function(resolve, reject){
		steem.api.getActiveVotes(comment.author, comment.permlink, function(err, votes){
			var selfVote = false;
			var voteCount = 0;
			if (votes.length > 0){
				for (var j = 0; j < votes.length; j++){
					if (votes[j].percent>0){
						voteCount++
						if (votes[j].voter == user){selfVote = true}
					}
				}
			} resolve({"comment": comment, "net_votes": voteCount, "voteStatus": selfVote});
		})
	})
}
function getCommentStatus(author, perm, objId){
	//Retrieves the comment ratio between pro/con
	return new Promise(function(resolve, reject){
		steem.api.getContentReplies(author, perm, function(err, comments) {
			var proCount = 0;
			var conCount = 0;
			if (comments.length > 0){
				for (var i = 0; i < comments.length; i++){
					if (JSON.parse(comments[i].json_metadata).type == "pro"){
						proCount++;
					} else if (JSON.parse(comments[i].json_metadata).type == "con"){
						conCount++;
					}
				} 	
			}
			resolve(["("+proCount+"/"+conCount+")", objId])
		})
	})
}
function writeArgumentList(comments, divID){
	//Retrieves the list of arguments (both pro and con) and returns a html usable string
	var PromiseList = [];
	function sortReplies(replyList){
		var sortedList = replyList.sort(function(a, b){
			if (a.net_votes < b.net_votes){
				return 1
			} else {return -1}
		})
		return sortedList;
	}
	var body = "<center>"+divID.toUpperCase()+"</center>";
	if (user != "" && user != undefined){
		body += writeCommentBox("statement "+divID);
	}
	document.getElementById(activePerm).getElementsByClassName(divID)[0].innerHTML = body
	if (comments.length > 0){
		for (var i = 0; i < comments.length; i++){
			PromiseList.push(getVoteStatus(comments[i]))
		}
		Promise.all(PromiseList).then(function(values){
			values = sortReplies(values)
			for (var i = 0; i < values.length; i++){
				var line = ""
				var voteType = "upvote";
				var comment = values[i].comment
				var attributes = ""
				if (values[i].voteStatus){
					voteType = "removeVote";
					attributes = " style = \"background-color: #3b9954\" onmouseover=\"this.style.backgroundColor = \'#ba5925\';\" onmouseout=\"this.style.backgroundColor=\'#3b9954\';\""
				};
				line += "<h3 style = 'line-height: 1px;' id = de-"+comment.permlink+">"
				if (user != "" && user != undefined){
					line += "<p class='voteCounter'>"+values[i].net_votes+"</p><div class = \"relevantButton\" onclick=\""+voteType+"(this, \'" + comment.author + "\',\'" + comment.permlink + "\')\" " + attributes +">"
					line += "<div></div></div>"
				}
				line += "<a class=\"commentLink\" onclick=\"writeDropDown(event,\'" + comment.author + "\', \'" + comment.permlink + "\')\"> "
				line += comment.body+"<p class='ratio' id='ratio-"+comment.permlink+"'></p></a>"
				if (comment.author==user && comment.children == 0 && comment.active_votes.length == 0){
					line += "<a class = \"removeButton\" onclick = \"deleteComment(\'"+comment.author+"\',\'"+comment.permlink+"\')\">    remove</a>"
				}
				body +="</h3>"
				document.getElementById(activePerm).getElementsByClassName(divID)[0].innerHTML += line
				getCommentStatus(comment.author, comment.permlink, "ratio-"+comment.permlink).then(function(ratio){document.getElementById(ratio[1]).innerHTML = ratio[0];})

			}
		})
	} else{
		body += "<p>No arguments on this point</p>"
		document.getElementById(activePerm).getElementsByClassName(divID)[0].innerHTML = body;
	}
}
function writeCommentList(commentList){
	//Retrieves all comments and puts then in a html usable string
	var commentCount = commentList.length;
	var body = ""
	if (commentCount > 0){
		body = ""
		
		body += "<button class=\"collapsibleButton comments\" onclick=\"commentsDropDown(this)\">View comments on this statement (" + commentCount + ")</button>"
		
		body += "<div class=\"commentList com\">";
		if (user != "" && user != undefined){
			body += writeCommentBox("comment");
		}
		var commentline = ""
		for (var i = 0; i < commentCount; i++){
			var removeButton = ""
			if (user == commentList[i].author && commentList[i].children == 0 && commentList[i].active_votes.length == 0){
				removeButton = "<a class = \"removeButton\" onclick = \"deleteComment(\'"+commentList[i].author+"\',\'"+commentList[i].permlink+"\')\">    remove</a>"
			}
			body += "<p id = de-"+commentList[i].permlink+"><strong>" + commentList[i].author + "</strong> - " + commentList[i].body + removeButton + "</p>"
		}
	} else{
		body = "<button class=\"collapsibleButton comments\" onclick=\"commentsDropDown(this)\">There are no comments on this statement</button>"
		body += "<div class=\"commentList\">";
		if (user != "" && user != undefined){
			body += writeCommentBox("comment");
		}
	}
	body += "</div>"
	return body
}
function writeCommentBox(action){
	//Write the box for leaving a comment. Buttons for each action type require a specific function
	if (action == "statement pro"){
		var body = "<div class = \""+action+"Box\"><button class = \"collapsibleButton\" onclick = \"showCommentBox(this)\">Add statement</button>"
		body += "<div class = \"inputZone\"><textarea name = \"comment\" rows = \"3\"></textarea><br>"
		body += "<button onclick = \"comment(this.previousElementSibling.previousElementSibling, \'pro\')\">post</button></div></div>"
		return body;
	} 
	else if (action == "statement con"){
		var body = "<div class = \""+action+"Box\"><button class = \"collapsibleButton\" onclick = \"showCommentBox(this)\">Add statement</button>"
		body += "<div class = \"inputZone\"><textarea name = \"comment\" rows = \"3\"></textarea><br>"
		body += "<button onclick = \"comment(this.previousElementSibling.previousElementSibling, \'con\')\">post</button></div></div>"
		return body;
	}
	else if (action == "comment"){
		var body = "<div class = \""+action+"Box\"><button class = \"collapsibleButton\" onclick = \"showCommentBox(this)\">Add comment</button>"
		body += "<div class = \"inputZone\"><textarea name = \"comment\" rows = \"3\"></textarea><br>"
		body += "<button onclick = \"comment(this.previousElementSibling.previousElementSibling, \'com\')\">post</button></div></div>"
		return body;
	}
}
function writeDropDown(evt, author, perm){
	//Writes a new discussion when clicked
	checkForParent(author, perm).then(function(parent){
		if (!parent[0]){ //There is no higher parent
			if (parentPerm == "" && parentAuthor == ""){ //This is discussion top statement
				if (perm == activePerm){var shouldreturn = true;}
				closeDropDown(activePerm);
				if (shouldreturn){return;}
			}
			activePerm = perm; activeAuthor = author; //new main discussion
			readingPerm = perm; readingAuthor = author;
			parentPerm = ""; parentAuthor = ""; //Reset parents
		} else { //parent becomes parent en current perm becomes reading Perm
			parentPerm = parent[2];
			parentAuthor = parent[1];
			readingPerm = perm;
			readingAuthor = author
		}
		
		var bodydiv = document.getElementById(activePerm);
		var allDiscussionBodies = document.getElementsByClassName("discussionBody");
		var body = ""
		steem.api.getContent(author, perm, function(err, post) {
			getPostArguments(author, perm).then(function(ArgDict){
				var info = getPostData(post);
				discussionBody = bodydiv.getElementsByClassName("discussionBody")[0]
				if (parentAuthor != "" && parentPerm != ""){
					body += "<button class=\"backButton\" onclick = \"writeDropDown(event, \'"+parentAuthor+"\', \'"+parentPerm+"\')\">back</button><br>";
				}
				body += "<div id = 'button-"+readingPerm+"' style='display: inline-block' ></div>"
				body += "<h1 style='display: inline-block'>" + info.title + "</h1>";
				body += "<p><strong>By: " + info.author + "</strong> - " + info.reward + "</p>";
				body += "<p>"+ info.description + "</p>";
				body += writeCommentList(ArgDict.com);
				body += "<div class=\"argumentRow\"><div class=\"pro argumentColumn\" style = \"border-color: #ccffcc;\"><center>PRO</center>";
				body += "</div><div class=\"con argumentColumn\"style = \"border-color: #ffcccc;\"><center>CON</center>";
				body += "</div></div>";
				discussionBody.innerHTML = body;
				openDropDown(activePerm)
				if (user != "" && user != undefined){
					var upvoteButtonBody = ""
					getVoteStatus(post).then(function(values){
						if (values.voteStatus){
							upvoteButtonBody += "<div class='triangle' onclick=\"removeVote(this, '" + readingAuthor + "',\'" + readingPerm + "\')\""
							upvoteButtonBody += " style = \"border-bottom: 25px solid #3b9954\" onmouseover=\"this.style.borderBottom = '25px solid #ba5925';\" onmouseout=\"this.style.borderBottom='25px solid #3b9954';\"</div>"
						} else {
							upvoteButtonBody += "<div class='triangle' onclick=\"upvote(this, '" + readingAuthor + "','" + readingPerm + "')\"></div>"
						}
						document.getElementById("button-"+readingPerm).innerHTML = upvoteButtonBody
					})	
				}
				writeArgumentList(ArgDict.pro, "pro");
				writeArgumentList(ArgDict.con, "con");
				
				
			})
		});
	});
}
