var highlighter = require("./codemirror/stexadaptor.js");
var highlighter = highlighter.highlighter("stex");
var padMessageHandler = require("ep_etherpad-lite/node/handler/PadMessageHandler");
var Changeset = require("ep_etherpad-lite/static/js/Changeset.js");
var AttribFactory = require("ep_etherpad-lite/static/js/AttributePool");

exports.onNewChanges = function(hook_name, args, cb) {
    pad = args["pad"];
    
    cs = highlighter.highlight(pad.atext, pad.pool);

    return cb([cs]);
}