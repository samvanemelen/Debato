var accessToken = "", expiresIn = "", user = "", cookie = "";
var api

updateLoginStatus();

function publish(){
	if (user == "" || user == undefined){
		alert("Please log in before publishing a discussion");
		window.location.href = "index";
	}
	//Publish a new discussion
	var title = document.getElementById("discussionTitle").value;
	var titleLow = title.toLowerCase();
	var body = document.getElementById("discussionBody").value;
	var tags = document.getElementById("discussionTags").value;
	var coverImage = document.getElementById("coverImage").value;
	if (title == "" || body == "" || tags == "" || coverImage == ""){
		alert("Please make sure to fill in all fields")
		return
	}
	for (var i = 0; i < tags.length; i++){
		if (!"abcdefghijklmnopqrstuvwxyz- ".includes(tags.charAt(i))){
			alert("Your tags should be separated by spaces and consist only out of lowercase letters")
			return
		}
	}
	document.getElementById("coverImage").disabled = true;
	document.getElementById("discussionTitle").disabled = true;
	document.getElementById("discussionBody").disabled = true;
	document.getElementById("discussionTags").disabled = true;
	document.getElementById("publishBtn").disabled = false;
	var perm = ""
	for(var i = 0; i < titleLow.length; i++){
		if("abcdefghijklmnopqrstuvwxyz-".includes(titleLow.charAt(i))){
			perm += titleLow.charAt(i);
		} else {perm+= "-"}
	}
	var taglist = tags.split(" ");
		var tagsMeta = '{"image":["'+coverImage+'"], "tags":["debato",'
	for(var i = 0; i < taglist.length; i++){
		tagsMeta += '"' + taglist[i] + '"'
		if (i+1<taglist.length){tagsMeta += ","}
	}
	tagsMeta += '], "context":"'+body+'"'
	tagsMeta += "}"
	body = '<center>'+body+' <br> To view the structured discussion or engage in the debate, view the topic on '
	body += '<a href=\'www.debato.org/discussion?a='+user+'&p='+perm+'\'>www.debato.org/discussion?a='+user+'&p='+perm+'</a>'
	body += '<img src = \''+coverImage+'\'/></center>'
	var randomstr = ""
	var possible = "1234567890abcdefghijklmnopqrstuvwxyz";
	for (var i = 0; i < 5; i++){randomstr += possible.charAt(Math.floor(Math.random() * possible.length))}
	perm += randomstr
	console.log("", "debato", user, perm, title, body, JSON.parse(tagsMeta))
	api.comment("", "debato", user, perm, title, body, JSON.parse(tagsMeta), function(err, res){
		if (res){
			window.location.href = 'discussion?a='+user+'&p=' + perm;
		} else {
			alert("Could not publish the discussion. Please refresh the page or try again later")
			document.getElementById("coverImage").disabled = false;
			document.getElementById("discussionTitle").disabled = false;
			document.getElementById("discussionBody").disabled = false;
			document.getElementById("discussionTags").disabled = false;
			document.getElementById("publishBtn").disabled = false;
		}
		console.log(err, res)
	})
}