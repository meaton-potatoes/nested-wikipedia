//search for the top 10 most relevant Wiki terms to what user searches for
function search(what, where) {
	var url = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=10&namespace=0&suggest=&redirects=return&format=json&search=" + what + "&callback=?";
	$.getJSON(url ,function(JSON) {
		var searchArray = [];
		for (var i = 0; i < JSON[1].length; i++) {
			searchArray.push([JSON[1][i],JSON[2][i], JSON[3][i]]);
		}
		if (where === "searchResults") {
			revealSearchResults(searchArray);
		}
	});
}

//parse the searchArray to add to searchResults
function revealSearchResults(array) {
	var output = "";
	for (var i = 0; i < array.length; i++) {
		output += "<li title='" + array[i][1] + "'>" + array[i][0] + "</li>";
	}
	$("#searchResults").hide();
	$("#searchResults").html(output);
	$("#searchResults").slideDown("fast");
}

function getPageid(word, where) {
	var url = "https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=return&titles=" + word + "&callback=?";
	var pageid;
	$.getJSON(url ,function(JSON) {
		$.each(JSON.query.pages, function(i,item){
			pageid = item.pageid;
			if (pageid !== undefined) {
				revealExtract(pageid, where);	
			}
		})
	});
}

function revealExtract(pageid, where) {
	var url = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exsectionformat=plain&pageids=" + pageid + "&callback=?";
	$.getJSON(url, function(JSON) {
		$.each(JSON.query.pages, function(i, item) {
			if (where === "main") {
				$("#main").html(item.extract);
				$("#main").prepend("<h1>" + item.title + "</h1>");
			} else if (where === "supporting") {
				$("#supportingArticles").append("<div class='well well-sm' id='" + item.title + "'><i class='fa fa-external-link-square corner-expand'></i><i class='fa fa-times corner-x'></i><h5>" + item.title + "</h5>" + item.extract + "</div>");
			}
			});
	});
}



//Click on searchResults and be able to view in main window
$("#searchResults").on("click", "li", function(){
	getPageid($(this).text(), "main");
});

//Click on the trash can and clear all supporting articles
function clearSupporting() {
	$("#supportingArticles").html("");
}

//Click the minimize button to hide or reveal searchResults
$(".minimize").click(function(){
	$("#searchResults").slideToggle("fast");
});

//Supporting Articles buttons
$("#supportingArticles").on("click", "div i", function(){
	//When you click on the small x, it deletes the article
	if ($(this).hasClass("fa-times")) {
		$(this).parent().remove();
	} else if ($(this).hasClass("fa-external-link-square")) {
		//When you click the external link button, it opens the supporting article in main window, NOT CURRENTLY WORKING
		getPageid($(this).parent().attr("id"), "main");
	}
});


//Highlight a word/term in main or supporting windows and add its Wiki to supporting articles
$("#main, #supportingArticles").mouseup(function(){
	var highlight = window.getSelection().toString();
	if (highlight.length > 0) {
		getPageid(highlight,"supporting");
	}
});
