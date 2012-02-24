var trie = require("./trie.js").trie;
var trieSearch = require("./aho.js").trieSearch;
var porter = require("./porter.js").porter;

exports.linkersrv = function(text, aho_root, aho_state) {
    function token(text, start, finish) {
	this.text = text;
	this.start = start;
	this.finish = finish;
	return this;
    }
    
    function tokenizer(text) {
	var tokens = [];
	for (i=0; i<text.length; ++i) {
	    if (/[a-zA-Z]/.test(text[i])) {
		b=i;
		for (; i<text.length && /[a-zA-Z]/.test(text[i]); ++i);
		e=--i;
		tokens.push(new token(text.substr(b, e-b+1), b, e));
	    }
	    if (/[.!\\(\\)]/.test(text[i])) {
		tokens.push(new token(text.substr(i, 1), i, i));		
	    }	    
	}
	return tokens;
    }

    

    stemmed_tokens = tokenizer(text).map(function(token) {
	token.text = porter(token.text);
	return token;
    });

    for (i=0; i<stemmed_tokens.length; ++i) {
	aho_state = trieSearch(root, lines[i], function(words, begin, end) {
		success0(words, i, begin, end);
	}, aho_state);

    }
    
    return stemmed_tokens;
}


root = new trie.Trie();
root.add(" abbelian group", 0);
root.add(" group", 1);

console.log(exports.linkersrv("We call. abbelians groups", root, 0));
