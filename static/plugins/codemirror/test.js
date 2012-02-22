var CodeMirror = require("./codemirror.js").CodeMirror;
var stex = require("./mode/stex/stex.js");
stex.init(CodeMirror);
mode = CodeMirror.getMode([], "stex");

var state = mode.startState();
var res = CodeMirror.highlight("test \\begin{", mode, state);
console.log(res);
var res = CodeMirror.highlight("test} lala", mode, state);
console.log(state);
console.log(res);
