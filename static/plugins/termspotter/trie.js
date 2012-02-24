exports.trie = (function() {

    trie = { nodeid : 0 }; 

    trie.Trie = function() {
	this.stateMap = [];
	this.root = new trie.TrieNode(this, '');
    }
    
    trie.Trie.prototype.add = function(word, id) {
	this.root.add(word, id);
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
    
    trie.TrieNode.prototype.add = function(word, id) {
	if(word){
	    var k = word.charAt(0);
	    (this.children[k] || (this.children[k] = new trie.TrieNode(this.trie, this.prefix+k)))
		.add(word.substring(1), id);
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
