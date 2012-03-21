var autolinker = require("./autolinker.js");
var autolinker = autolinker.autolinker();
var padMessageHandler = require("ep_etherpad-lite/node/handler/PadMessageHandler");
var Changeset = require("ep_etherpad-lite/static/js/Changeset.js");
var AttribFactory = require("ep_etherpad-lite/static/js/AttributePoolFactory");

exports.onNewChanges = function(hook_name, args, cb) {
    pad = args["pad"];

    cs = autolinker.link(pad.atext, pad.apool());

    return cb([cs]);
}

exports.attribsToClasses = function(hook_name, args, cb) {
    console.log(cb);
}

exports.onUIEvent = function(hook_name, args, cb) {
    args = args.split("/");
    if (args[0]=="choice") {
	choices = [];	
	args[1].split(".").forEach(function(elem) {
	    term = autolinker.getDictioraryTerm(elem);
	    choices.push({
		"text": "Did you mean cd="+term.cd+" name="+term.name,
		"val" : "apply/"+elem
	    });
	});
	result = {
	    title: "Did you mean:",
	    choices: choices
	};
	return cb(result);
    }
    return cb([]);
}
