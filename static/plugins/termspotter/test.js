var trie = require("./trie.js").trie;
var trieSearch = require("./aho.js").trieSearch;
var porter = require("./porter.js");

var lines=[
" the group group abbelian", " group", " fasdg asdg asdg asdg fsd g"];

_normalizePos = function(pos) {
	for (; pos.col<0 && pos.line>0; ) {
		pos.line--;
		pos.col += lines[pos.line].length;
	}
}

root = new trie.Trie();
root.add(" abbelian group", 0);
root.add(" group", 1);

function success0(words, line, begin, end) {
	pos1 = {line:line, col:begin+1};
	pos2 = {line:line, col:end};

	this._normalizePos(pos1);
	this._normalizePos(pos2);
	console.log("found "+words+" "+pos1.line+":"+pos1.col+"-"+pos2.line+":"+pos2.col);
}

status = 0;
for (i=0; i<lines.length; ++i) {
	status = trieSearch(root, lines[i], function(words, begin, end) {
		success0(words, i, begin, end);
	}, status);
}
