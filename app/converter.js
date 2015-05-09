// Converts plaintext englishWords.txt to trie englishWords.json
var fs = require("fs");

fs.readFile('englishWords.txt', function (err, data) {
	if (err) throw err;
	var englishWords = data.toString().split("\n"),
		trie = {};
	for (var i = 0; i < englishWords.length; i++) {
		var word = englishWords[i],
			curr = trie;
		for (var j = 0; j < word.length; j++) {
			var letter = word[j];
			if (typeof curr[letter] == 'undefined') {
				curr[letter] = {};
			}
			curr = curr[letter];
		}
		curr["$"] = 1; // end of word
	}
	fs.writeFile('englishWords.json', JSON.stringify(trie), function (err) {
		if (err) throw err;
		console.log('Conversion succeeded!');
	});
});