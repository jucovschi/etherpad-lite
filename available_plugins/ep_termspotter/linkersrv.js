var trie = require("./trie.js").trie;
var trieSearch = require("./aho.js").trieSearch;
var porter = require("./porter.js").porter;

exports.linkersrv = function(text, aho_root, aho_state) {
    function token(text, start, finish) {
	this.text = text;
	this.start = start;
	this.finish = finish;

	this.get = function() {
	    return this.text;
	}
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
	token.text = aho_root.getWordID(porter(token.text));
	return token;
    });

    stemmed_tokens.push(-1);
    result = [];

    aho_state = trieSearch(aho_root, stemmed_tokens, function(words, begin, end) {
	result.push(new token(words, stemmed_tokens[begin].start, stemmed_tokens[end].finish));
    }, aho_state);
    
    return result;
}



