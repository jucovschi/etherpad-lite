exports.onAddJS = function(hook_name, args, cb) {
    return cb(["../plugins/ep_termspotter/static/jquery.livequery.js", "../plugins/ep_termspotter/static/interaction.js"]);
}

exports.onAddCSS = function(hook_name, args, cb) {
    return cb(["../plugins/ep_termspotter/static/interaction.css"]);
}

exports.onCreateDomLine = function(hook_name, args, cb) {
    console.log("onCreateDomLine", args);
    return cb([]);
}