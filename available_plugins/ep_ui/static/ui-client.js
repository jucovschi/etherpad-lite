exports.onAceAttribsToClasses = function(hook_name, args, cb) {
    obj = args.key.split(":");
    if (obj[0] == "highlight-css") {
	return cb([args.value]);
    }

    if (obj[0] == "ui-decoration") {
	return cb([args.value]);
    }

    if (obj[0] == "choice") {
	return cb(["choice "+obj.join("-")+"-"+args.value]);
    }
}

var contextMenu = null;
var reg = new RegExp("choice-([^-]+)-([^ ]+)");

exports.onContextMenu = function(hook_name, args, cb) {
    className = args.className;
    $args = $(args);

    var posX = $args.offset().left+$args.width()+30;
    var posY = $args.offset().top+40+$args.height();
    var showMenu = false;

    var len = 0;
    while (_match = reg.exec(className)) {
	var match = _match;
	className = className.substr(match.index+match[0].length);
	showMenu = true;
	$.ajax({
	    type: "get",
	    url : "/ui/"+match[1]+"/choice/"+match[2],
	    success: function(data) {
		if (contextMenu == null) {
		    $("body").append($("<div>").attr("id","ui-context").append("<p>Generic Text</p>"));
		}
		data = JSON.parse(data);
		var title = data.title;
		var choices = data.choices;
		var buttons = data.buttons;

		$("#ui-context").each(function(idx, obj) {
		    $(obj).empty();
		    html = [];
		    html.push("<h2>"+title+"</h2>");
		    html.push("<form>");
		    choices.forEach(function (val) {
			html.push("<input type='radio' name='context-choice' value='"+val.val+"'><label>"+val.text+"</label><br/>");
		    });
		    html.push("</form>");
		    obj.innerHTML = html.join(" ");
		    var btn = {};
		    buttons.forEach(function(button) {
			var b = button;
			btn[b.title] = function() {
			    url = "choice-res/"+match[1]+"/";
			    alert(url);
			};			
		    });
		    
		    $(obj).dialog({
			title:"Please make a choice", 
			position:[posX,posY],
			buttons: btn
		    });
		});		
	    }
	});
    }

    
    return cb([showMenu]);
}

exports.onAddCSS = function(hook_name, args, cb) {
    return cb(["../plugins/ep_ui/static/ui-lightness/jquery-ui.css"]);
}

exports.onAddInnerCSS = function(hook_name, args, cb) {
    return cb(["../plugins/ep_ui/static/ui.css"]);
}


exports.onAddJS = function(hook_name, args, cb) {
    return cb(["../plugins/ep_ui/static/jquery-ui.js"]);
}