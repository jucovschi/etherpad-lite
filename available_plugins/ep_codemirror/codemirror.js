var highlighter = require("./codemirror/stexadaptor.js");
var highlighter = highlighter.highlighter("stex");
var padMessageHandler = require("ep_etherpad-lite/node/handler/PadMessageHandler");
var Changeset = require("ep_etherpad-lite/static/js/Changeset.js");
var AttribFactory = require("ep_etherpad-lite/static/js/AttributePoolFactory");

exports.onNewChanges = function(hook_name, args, cb) {
    _pad = args["pad"];
    
    pad = { "atext" : Changeset.cloneAText(_pad.atext),
	    "pool" : _pad.apool(),
	   };

    pad.apool = function() { return this.pool; }

    oldAttr = _pad.atext.attribs;

    cs = highlighter.highlight(pad.atext, pad.pool);

    if (!Changeset.checkRep(cs)) {
	console.log("your changeset is bad man!");
	return;
    }
    
    newAText = Changeset.applyToAText(cs, pad.atext, pad.apool());
    newAttr = newAText.attribs;

    if (oldAttr != newAttr) {
	console.log("ok we need to update");
	_pad.appendRevision(cs);
	padMessageHandler.updatePadClients(_pad, cb);
    } else {
	cb(["no changes to be made"]);
    }
}