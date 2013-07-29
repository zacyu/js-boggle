var englishWords = new Array();
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
	//console.log(startIndex, stopIndex, middle);
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

$(document).ready(function() {
	var currentWord = "";
	var lastRow, lastCol;
	var playerWords;
	var allWords;
	var flag = new Object();
	var boardMapStr;
	var boggleSize;
	var gameOver = false;

	function letterOnClick(row, col) {
		if (gameOver)
			return false;
		if (currentWord.length > 0 && (Math.abs(row - lastRow) > 1 || Math.abs(col - lastCol) > 1))
			return false;
		if (flag[row * boggleSize + col] == true)
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
		playerWords = new Array();
		allWords = new Array();
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
		wordCard.hide();
		if (isComputer) {
			$('#computerScoreBoard .wordCardContainer').append(wordCard);
			$('#computerScore').text(parseInt($('#computerScore').text()) + point);
		} else {
			$('#humanScoreBoard .wordCardContainer').append(wordCard);
			$('#humanScore').text(parseInt($('#humanScore').text()) + point);
		}
		wordCard.slideDown(500, function() {
			if (isComputer)
				$('#computerScoreBoard .wordCardContainer').scrollTop(10000000);
			else
				$('#humanScoreBoard .wordCardContainer').scrollTop(10000000);
		});
	}

	function findAllWords(word, passedflag, x, y) {
		var newFlag = $.extend({}, passedflag);
		newFlag[x * boggleSize + y] = true;
		word += boardMapStr[x * boggleSize + y];
		if (word.length > 3 && binarySearch(englishWords, word.toLowerCase()) > -1 && binarySearch(allWords, word) < 0) {
			binaryInsert(allWords, word);
		}
		for (var i = x - 1; i <= x + 1; i++)
			for (var j = y - 1; j <= y + 1; j++)
				if (i >= 0 && i < boggleSize && j >= 0 && j < boggleSize && newFlag[i * boggleSize + j] != true && binarySearchPrefix(englishWords, (word + boardMapStr[i * boggleSize + j]).toLowerCase())) {
					findAllWords(word, newFlag, i, j);
				}
	}
	$.get('englishWords.txt', function(data) {
		englishWords = data.split('\n');
		gameReady();
	});
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
			} else if (binarySearch(englishWords, currentWord.toLowerCase()) < 0) {
				updateMonitor("'" + currentWord + "' is not a word");
			} else if (binarySearch(playerWords, currentWord) > -1) {
				updateMonitor("You already have '" + currentWord + "'");
			} else {
				recordWord(currentWord);
				binaryInsert(playerWords, currentWord);
				updateMonitor("You find '" + currentWord + "'");
			}
			currentWord = "";
			flag = new Object();
			$('#mainBtn').text("End Turn");
			$('.letterBox.selected').removeClass('selected');
		} else {
			for (var i = 0; i < boggleSize; i++)
				for (var j = 0; j < boggleSize; j++) {
					var passedflag = new Object();
					findAllWords("", passedflag, i, j);
				}
			for (var i = 0; i < allWords.length; i++) {
				var word = allWords[i];
				if (binarySearch(playerWords, word) < 0) {
					recordWord(word, true);
				}
			}
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
})