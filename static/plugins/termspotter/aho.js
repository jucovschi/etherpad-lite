

//Online Trie-based String Search Algorithm
//O(nm) - n length of the haystack string, 
//m length of the maximum length of dictionary words
//Arguments:
//trie - a Trie as per http://is.gd/1Y9FT
//s - string to be searched
exports.trieSearch = function(trie, s, foundfnc, start_node) {
	var current = typeof(start_node) != 'undefined' ? trie.stateMap[start_node] : trie.root;
	for (var i=0; i<s.length; i++) {
		var r = current.hasChild(s[i]);
		if (r) {
			current = r;
			if (current.hasMatchedWords()) {
				foundfnc(current.getMatchedWords(), i - current.prefixLength+1, i);
			}
		} else {
			if (current.prefixLength>1) {
				current = trie.stateMap[exports.trieSearch(trie, current.prefix.substr(1)+s[i], 
						function (words, begin, end) {
							foundfnc(words, i - current.prefixLength + begin + 1, i - current.prefixLength + end + 1);
						})];
			}
			else
				current = trie.root;
		}
	}
	return current.state;
}
