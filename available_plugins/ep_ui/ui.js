var plugins = require("ep_etherpad-lite/static/js/pluginfw/plugins");
var randonString = require('ep_etherpad-lite/static/js/pad_utils').randomString;
var getAuthor4Token = require('ep_etherpad-lite/node/db/AuthorManager').getAuthor4Token;
var async = require('async');
var interactionData = [];

var hookCallWrapper = function (hook, hook_name, args, cb) {
  if (cb === undefined) cb = function (x) { return x; };
  try {
    return hook.hook_fn(hook_name, args, cb);
  } catch (ex) {
    console.error([hook_name, hook.part.full_name, ex.stack || ex]);
  }
}

function initInteraction(token, data) {
	author = getAuthor4Token(token, function() {});
	data ["author"] = author; 
	interactionData[token] = data;
}

function getInteractionData(token) {
	return interactionData[token];
}

exports.expressCreateServer = function(hook_name, args, cb) {
    args.app.get("/ui/:plugin/:args(*)", function(req, res, next) {
	var plugin_name = req.params["plugin"];
	var args = req.params["args"];
	args = args.split("/");
	
	// a new interaction has to be initiated and an UID generated
	if (args[0]=="init") {
	    args.shift(1);
	    var token = args.shift(1);
	    var padid = args.shift(1);
	    var offset = args.shift(1);
	    initInteraction(token, {"offset":offset,"padid":padid});
	}
	if (args[0]=="data") {
	    args.shift(1);
	    var token = args.shift(1);
	}
	
	if (plugins.hooks["onUIEvent"] === undefined) return cb([]);
	plugins.hooks["onUIEvent"].map(function (hook) {
	    if (hook.part.name==plugin_name) {
		result = hookCallWrapper(hook, hook_name, {"state": getInteractionData(token), "args":args});
		if (typeof(result)==="string")
		    res.write(result);
		else
		    res.write(JSON.stringify(result));
	    };
	});
	res.end();
	return cb([]);
    });
}