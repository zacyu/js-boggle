var englishWords = [];
var STANDARD_CUBES = [
	"AAEEGN", "ABBJOO", "ACHOPS", "AFFKPS",
	"AOOTTW", "CIMOTU", "DEILRX", "DELRVY",
	"DISTTY", "EEGHNW", "EEINSU", "EHRTVW",
	"EIOSST", "ELRTTY", "HIMNQU", "HLNNRZ"
];
var BIG_BOGGLE_CUBES = [
	"AAAFRS", "AAEEEE", "AAFIRS", "ADENNN", "AEEEEM",
	"AEEGMU", "AEGMNN", "AFIRSY", "BJKQXZ", "CCNSTW",
	"CEIILT", "CEILPT", "CEIPST", "DDLNOR", "DDHNOT",
	"DHHLOR", "DHLNOR", "EIIITT", "EMOTTT", "ENSSSU",
	"FIPRSY", "GORRVW", "HIPRRY", "NOOTUW", "OOOTTU"
];

function binarySearch(items, value) {
	var startIndex = 0,
		stopIndex = items.length - 1,
		middle = Math.floor((stopIndex + startIndex) / 2);
	while (items[middle] != value && startIndex < stopIndex) {
		if (value < items[middle]) {
			stopIndex = middle - 1;
		} else if (value > items[middle]) {
			startIndex = middle + 1;
		}
		middle = Math.floor((stopIndex + startIndex) / 2);
	}
	return (items[middle] != value) ? -1 : middle;
}

function binarySearchPrefix(items, value) {
	var startIndex = 0,
		stopIndex = items.length - 1,
		middle = Math.floor((stopIndex + startIndex) / 2);
	while (items[middle].substring(0, value.length) != value && startIndex < stopIndex) {
		if (value < items[middle].substring(0, value.length)) {
			stopIndex = middle - 1;
		} else if (value > items[middle].substring(0, value.length)) {
			startIndex = middle + 1;
		}
		middle = Math.floor(Math.abs(stopIndex + startIndex) / 2);
	}
	return items[middle].substring(0, value.length) == value;
}

function binaryInsert(items, value) {
	var startIndex = 0,
		stopIndex = items.length - 1,
		middle = Math.floor((stopIndex + startIndex) / 2);
	while (items[middle] != value && startIndex < stopIndex) {
		if (value < items[middle]) {
			stopIndex = middle - 1;
		} else if (value > items[middle]) {
			startIndex = middle + 1;
		}
		middle = Math.floor(Math.abs(stopIndex + startIndex) / 2);
	}
	if (items[middle] <= value)
		middle += 1;
	items.splice(middle, 0, value);
}

function trieSearch(trie, word, prefixOnly) {
	var curr = trie;
	for (var i = 0; i < word.length; i++) {
		if (typeof curr[word[i]] != 'object') return false;
		curr = curr[word[i]];
	}
	if (prefixOnly) return true;
	return curr['$'] == 1;
}

function trieInsert(trie, word) {
	var curr = trie;
	for (var j = 0; j < word.length; j++) {
		var letter = word[j];
		if (typeof curr[letter] == 'undefined') {
			curr[letter] = {};
		}
		curr = curr[letter];
	}
	curr["$"] = 1;
}

function trieIterator(trie, callback, prefix) {
	if (!prefix) prefix = "";
	Object.keys(trie).forEach(function(key) {
  		if (key == '$') {
			callback(prefix);
		} else {
			trieIterator(trie[key], callback, prefix + key);
		}
	});
}

$(document).ready(function() {
	var currentWord = "";
	var lastRow, lastCol;
	var englishWords;
	var allWords;
	var playerWords;
	var flag = {};
	var boardMapStr;
	var boggleSize;
	var gameOver = false;

	function letterOnClick(row, col) {
		if (gameOver)
			return false;
		if (currentWord.length > 0 && (Math.abs(row - lastRow) > 1 || Math.abs(col - lastCol) > 1))
			return false;
		if (flag[row * boggleSize + col])
			return false;
		currentWord += boardMapStr[row * boggleSize + col];
		flag[row * boggleSize + col] = true;
		$(".letterBox[row=\"" + row + "\"][col=\"" + col + "\"]").addClass("selected");
		lastRow = row;
		lastCol = col;
		updateMonitor();
		$('#mainBtn').text("End Word");
	}

	function monitorDisplay(str) {
		$('#infoLine').text($('#infoLine').text() + str[0]);
		if (str.length > 1) {
			setTimeout(function() {
				monitorDisplay(str.substring(1));
			}, 20);
		}
	}

	function updateMonitor(str) {
		if (typeof str !== "string") {
			$('#infoLine').text(currentWord + '_');
		} else {
			$('#infoLine').text('');
			monitorDisplay(str + '_');
		}
	}

	function loadBoggle(big) {
		playerWords = {};
		allWords = {};
		$('#gameCube .letterBox').remove();
		$('.wordCard').slideUp(500, function() {
			$(this).remove();
		});
		$('#humanScore').text(0);
		$('#computerScore').text(0);
		boardMapStr = "";
		var boardCube;
		if (big) {
			boggleSize = 5;
			$('#gameCube').attr('board', 'big');
			boardCube = BIG_BOGGLE_CUBES;
		} else {
			boggleSize = 4;
			$('#gameCube').attr('board', 'standard');
			boardCube = STANDARD_CUBES;
		}
		for (var i = 0; i < boggleSize * boggleSize; i++) {
			var randIndex = Math.floor((Math.random() * boggleSize * boggleSize));
			var tmp = boardCube[randIndex];
			boardCube[randIndex] = boardCube[i];
			boardCube[i] = tmp;
		}
		for (var i = 0; i < boggleSize * boggleSize; i++) {
			boardMapStr += boardCube[i][Math.floor((Math.random() * 6))];
		}
		for (var i = 0; i < boggleSize; i++)
			for (var j = 0; j < boggleSize; j++) {
				var letterBoxDiv = $('<div class="letterBox"></div>').attr({
					"row": i,
					"col": j
				}).data("pos", {
					"row": i,
					"col": j
				}).text(boardMapStr[i * boggleSize + j]).click(function() {
					if ($(this).hasClass('selected')) return false;
					var pos = $(this).data('pos');
					letterOnClick(pos.row, pos.col);
				}).mouseleave(function(e) {
					if(e.which) $(this).click();
				}).mouseenter(function(e) {
					if(e.which) $(this).click();
				});
				$('#gameCube').append(letterBoxDiv);
			}
		$('#mainBtn').text("End Turn").show();
		updateMonitor("Click On Letters Successively");
	}

	function gameReady() {
		$('#cover .waiting').fadeOut(500, function() {
			$('.startButton').css('opacity', 1);
		});
		$('#standardStardButton').click(function() {
			loadBoggle();
			$('#cover').fadeOut(500);
		});
		$('#bigStardButton').click(function() {
			loadBoggle(true);
			$('#cover').fadeOut(500);
		});
		updateMonitor('Welcome To Boggle');
	}

	function recordWord(word, isComputer) {
		if (word.length < 4) return false;
		word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		var point = word.length - 3;
		var wordCard = $('<div class="wordCard"><div class="word"></div><div class="point"></div></div>');
		wordCard.find('.word').text(word);
		wordCard.find('.point').text('+' + point);
		if (isComputer) {
			$('#computerScoreBoard .wordCardContainer').append(wordCard);
			$('#computerScore').text(parseInt($('#computerScore').text()) + point);
			$('#computerScoreBoard .wordCardContainer').scrollTop(10000000);
		} else {
			$('#humanScoreBoard .wordCardContainer').append(wordCard);
			$('#humanScore').text(parseInt($('#humanScore').text()) + point);
			wordCard.hide().slideDown(500, function() {
				$('#humanScoreBoard .wordCardContainer').scrollTop(10000000);
			});
		}
	}

	function findAllWords(word, passedflag, x, y) {
		var newFlag = $.extend({}, passedflag);
		newFlag[x * boggleSize + y] = true;
		word += boardMapStr[x * boggleSize + y];
		if (word.length > 3 && trieSearch(englishWords, word.toLowerCase()) && !trieSearch(allWords, word)) {
			trieInsert(allWords, word);
		}
		for (var i = x - 1; i <= x + 1; i++)
			for (var j = y - 1; j <= y + 1; j++)
				if (i >= 0 && i < boggleSize && j >= 0 && j < boggleSize && newFlag[i * boggleSize + j] != true && trieSearch(englishWords, (word + boardMapStr[i * boggleSize + j]).toLowerCase(), true)) {
					findAllWords(word, newFlag, i, j);
				}
	}
	$.get('englishWords.json', function(data) {
		englishWords = data;
		gameReady();
	}, 'json');
	$('#mainBtn').click(function() {
		if (gameOver) {
			gameOver = false;
			$("#cover").fadeIn(500);
			$(this).fadeOut(500);
			return;
		}
		if (currentWord.length > 0) {
			if (currentWord.length < 4) {
				updateMonitor("'" + currentWord + "' is too short");
			} else if (!trieSearch(englishWords, currentWord.toLowerCase())) {
				updateMonitor("'" + currentWord + "' is not a word");
			} else if (trieSearch(playerWords, currentWord)) {
				updateMonitor("You already have '" + currentWord + "'");
			} else {
				recordWord(currentWord);
				trieInsert(playerWords, currentWord);
				updateMonitor("You find '" + currentWord + "'");
			}
			currentWord = "";
			flag = {};
			$('#mainBtn').text("End Turn");
			$('.letterBox.selected').removeClass('selected');
		} else {
			for (var i = 0; i < boggleSize; i++)
				for (var j = 0; j < boggleSize; j++) {
					var passedflag = {};
					findAllWords("", passedflag, i, j);
				}
			trieIterator(allWords, function(word) {
				if (!trieSearch(playerWords, word)) {
					recordWord(word, true);
				}
			});
			var computerScore = parseInt($('#computerScore').text()),
				humanScore = parseInt($('#humanScore').text());
			if (computerScore > humanScore) {
				updateMonitor("You lose by " + (computerScore - humanScore) + " points");
			} else if (computerScore == humanScore) {
				updateMonitor("Tie");
			} else {
				updateMonitor("You win by " + (humanScore - computerScore) + " points");
			}
			gameOver = true;
			$('#mainBtn').text('Play Again');
		}
	});
});