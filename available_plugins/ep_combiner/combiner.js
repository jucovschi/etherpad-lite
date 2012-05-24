var padMessageHandler = require("ep_etherpad-lite/node/handler/PadMessageHandler");
var Changeset = require("ep_etherpad-lite/static/js/Changeset.js");
var AttribFactory = require("ep_etherpad-lite/static/js/AttributePool");

var hooks = require("ep_etherpad-lite/static/js/pluginfw/hooks");

exports.onNewChanges = function(hook_name, args, cb) {

    _pad = args["pad"];
    
    pad = { "atext" : Changeset.cloneAText(_pad.atext),
	    "pool" : _pad.apool(),
	   };

    pad.apool = function() { return this.pool; }

    oldAttr = _pad.atext.attribs;

    allCS = hooks.callAll("srvGenChangeset",{"pad":_pad});
    if (allCS.length == 0)
	return;

    for (var i=1; i<allCS.length; ++i) {
	allCS[0] = Changeset.compose(allCS[0], allCS[i], pad.apool());
    }

    if (!Changeset.checkRep(allCS[0])) {
	console.log("your changeset is bad man!");
	return cb([]);;
    }
    
    newAText = Changeset.applyToAText(allCS[0], pad.atext, pad.apool());
    newAttr = newAText.attribs;
/*    console.log("new ",newAText);
    console.log("old ",oldAttr);
    console.log("pool ",pad.apool()); */
    if (oldAttr != newAttr) {
	console.log("ok we need to update");
	_pad.appendRevision(allCS[0]);
	padMessageHandler.updatePadClients(_pad, cb);
    } else {
	cb(["no changes to be made"]);
    }
}