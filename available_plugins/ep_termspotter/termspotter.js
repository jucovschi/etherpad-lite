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

