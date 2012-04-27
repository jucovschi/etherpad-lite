var readCookie = require('ep_etherpad-lite/static/js/pad_utils').readCookie;

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
var interactionProps;

function showDialog(title, html, btn) {
    if (contextMenu == null) {
	$("body").append($("<div>").attr("id","ui-context").append("<p>Generic Text</p>"));
    }
    $("#ui-context").each(function(idx, obj) {
	$(obj).empty();
	obj.innerHTML = html.join(" ");
	$(obj).dialog({
	    "title": title, 
	    "position":[interactionProps.posX,interactionProps.posY],
	    "buttons": btn
	});
    });
}

function hideDialog() {
    $("#ui-context").each(function(idx, obj) {
	$(obj).empty();
    });
}

function choiceInteraction(data) {
    var title = data.title;
    var choices = data.choices;
    var buttons = data.buttons;
    
    html = [];
    html.push("<h2>"+title+"</h2>");
    html.push("<form id='ui-context'>");
    choices.forEach(function (val) {
	html.push("<input type='radio' name='context-choice' value='"+val.val+"'><label>"+val.text+"</label><br/>");
    });
    html.push("</form>");
    var btn = {};
    buttons.forEach(function(button) {
	var b = button;
	btn[b.title] = function() {
	    val = $("#ui-context input:radio[name=context-choice]:checked").val();
	    if (typeof(val)!="undefined") {
		var token = readCookie("token");
		url = "/ui/"+interactionProps.mod+"/data/"+token+"/"+b.value+"/"+val;
		doInteract(url);
	    }
	};			
    });
    showDialog("Please make a choice", html, btn);
}

function doInteract(url) {
    $.ajax({
	"type": "get",
	"url" : url,
	success: function(data) {
	    data = JSON.parse(data);
	    if (data.type=="choice")
		choiceInteraction(data);
	    if (data.type=="end") {
		hideDialog();
	    }		
	}
    });
}

exports.onContextMenu = function(hook_name, args, cb) {
    evt = args[0];
    pos = args[1];
    var token = readCookie("token");
    var padId = document.location.pathname.substring(document.location.pathname.lastIndexOf("/") + 1);    
    className = evt.target.className;
    $args = $(evt.target);
    
    var posX = evt.pageX+30;
    var posY = evt.pageY+40;
    var showMenu = false;
    
    interactionProps = {
	"posX" : posX,
	"posY" : posY,
	"padId" : padId
    };
    
    var len = 0;
    while (_match = reg.exec(className)) {
	var match = _match;
	var mod = match[1];
	className = className.substr(match.index+match[0].length);
	showMenu = true;
	interactionProps.mod = mod;
	doInteract("/ui/"+mod+"/init/"+token+"/"+padId+"/"+pos+"/choice/"+match[2]);
    }
    return cb([showMenu]);
}

exports.onAddCSS = function(hook_name, args, cb) {
	return cb(["../plugins/ep_ui/static/ample/languages/xul/themes/default/style.css","../plugins/ep_ui/static/ui-lightness/jquery-ui.css"]);
}

exports.onAddInnerCSS = function(hook_name, args, cb) {
	return cb(["../plugins/ep_ui/static/ui.css"]);
}


exports.onAddJS = function(hook_name, args, cb) {
	return cb(["../plugins/ep_ui/static/ample/runtime.js",
	           "../plugins/ep_ui/static/ample/languages/xhtml/xhtml.js",	
	           "../plugins/ep_ui/static/ample/languages/xul/xul.js",
	           "../plugins/ep_ui/static/jquery-ui.js"]);
}