var porter = require("./porter.js").porter;

exports.trie = (function() {

    trie = { nodeid : 0 }; 

    trie.Trie = function() {
	this.stateMap = [];
	this.wordMap = [];
	this.words = 0;
	this.root = new trie.TrieNode(this, []);
    }

    trie.Trie.prototype.getWordID = function(w) {
	id = this.wordMap[w];
	if (typeof(id)=="undefined") 
	    return -1;
	else
	    return id;
    }

    trie.Trie.prototype.getWord = function(id) {
	return this.wordMap
    }
    
    trie.Trie.prototype.add = function(word, id) {
	var me = this;
	word = word.map(function(w) {
	    w = porter(w);
	    if (typeof(me.wordMap[w])=="undefined") 
		me.wordMap[w] = me.words++;
	    return me.wordMap[w];
	});
	me.root.add(word, 0, id);
    }
    
    trie.TrieNode = function(_trie, prefix) {
	this.trie = _trie;
	this.state = trie.nodeid++;
	this.prefix = prefix;
	this.prefixLength = prefix.length;
	this.trie.stateMap[this.state] = this;
	this.wordids = [];
	this.children = [];
    };
    
    trie.TrieNode.prototype.nodeid = 0;
    
    trie.Trie.prototype.getStatePrefix = function(id) {
	node = this.stateMap[id];
	return node?node.prefixLength:0;
    }

    function cloneAndAdd(arr, elem) {
	var res = arr.slice(0,arr.length);
	res.push(elem);
	return res;
    }

    trie.TrieNode.prototype.add = function(word, pos, id) {
	if(pos<word.length){
	    var k = word[pos];
	    (this.children[k] || (this.children[k] = new trie.TrieNode(this.trie, cloneAndAdd(this.prefix,k))))
		.add(word, pos+1, id);
	} else 
	    this.wordids.push(id);
    };
    
    trie.TrieNode.prototype.hasChild = function(ch) {
	return this.children[ch];
    };
    
    trie.TrieNode.prototype.getMatchedWords = function() {
	return this.wordids;
    }
    
    trie.TrieNode.prototype.hasMatchedWords = function() {
	return this.wordids.length>0;
    }
    
    return trie;
})();
