exports.onAceAttribsToClasses = function(hook_name, args, cb) {
    obj = args;
    if (obj.key == "highlight-css") {
	return cb([obj.value]);
    }
    if (obj.key == "autolinker") {
	return cb(["autolinker "+obj.value]);
    }
}

exports.onAddCSS = function(hook_name, args, cb) {
    return cb(["../plugins/ep_codemirror/static/css/stex.css"]);
}