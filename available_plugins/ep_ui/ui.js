var plugins = require("ep_etherpad-lite/static/js/pluginfw/plugins");


var hookCallWrapper = function (hook, hook_name, args, cb) {
  if (cb === undefined) cb = function (x) { return x; };
  try {
    return hook.hook_fn(hook_name, args, cb);
  } catch (ex) {
    console.error([hook_name, hook.part.full_name, ex.stack || ex]);
  }
}

exports.expressCreateServer = function(hook_name, args, cb) {
    args.app.get("/ui/:plugin/:args(*)", function(req, res, next) {
	var plugin_name = req.params["plugin"];
	var args = req.params["args"];

	if (plugins.hooks["onUIEvent"] === undefined) return cb([]);
	plugins.hooks["onUIEvent"].map(function (hook) {
	    if (hook.hook_fn_name.indexOf("ep_"+plugin_name)===0) {
		result = hookCallWrapper(hook, hook_name, args);
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