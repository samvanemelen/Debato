var accessToken = "", expiresIn = "", user = "", cookie = "", activeAuthor = "", activePerm = "", readingAuthor = "", readingPerm = "";
var parentAuthor = "", parentPerm = "";
var weight = 1000
var api

try{
	var cookieresult = document.cookie.split(";");
	user = cookieresult[0].split("=")[1];
	accessToken = cookieresult[1].split("=")[1];
}
catch(err){console.log(err)}

updateLoginStatus();

//Loads the discussion mentioned in the URL vars

var perm = getUrlVars()["p"]
var author = getUrlVars()["a"]
var discussionBody = document.getElementsByClassName("discussionBody")[0]
document.getElementById("discussion").id = perm
discussionBody.style.maxHeight = "none"
activePerm = perm
activeAuthor = author
readingPerm = perm
readingAuthor = author
var body = ""
steem.api.getContent(author, perm, function(err, post) {
	getPostArguments(author, perm).then(function(ArgDict){
		var info = getPostData(post);
		document.getElementsByClassName("thumbnail")[0].style.backgroundImage = "url("+info.thumbnail+")"
		body += "<div id = 'button-"+readingPerm+"' style='display: inline-block' ></div>"
		body += "<h1 style='display: inline-block'>" + info.title + "</h1>";
		body += "<p><strong>By: " + info.author + "</strong> - " + info.reward + "</p>";
		body += "<p>"+ info.description + "</p>";
		body += writeCommentList(ArgDict.com);
		body += "<div class=\"argumentRow\"><div class=\"pro argumentColumn\" style = \"border-color: #ccffcc;\"><center>PRO</center>";
		body += "</div><div class=\"con argumentColumn\"style = \"border-color: #ffcccc;\"><center>CON</center>";
		body += "</div></div>";
		discussionBody.innerHTML = body;
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