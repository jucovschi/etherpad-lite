exports.onAddCSS = function(hook_name, args, cb) {
    return cb(["../plugins/ep_codemirror/static/css/stex.css"]);
}