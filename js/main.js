'use strict'

const MINE = '<img class="mine-pic" src="img/mine.png">'
const FLAG = '<span class="flag">🚩</span>'
var gBoard;
var gLevel = {
    size: 4,
    mines: 2
}
var gGame
var gIsFirstClick = false;

function init() {
    clearInterval(gClockInterval)
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3,
    }
    gBoard = buildBoard()
    document.querySelector('.clock').innerText = '00:00'
    document.querySelector('.flag-counter').innerText = `Flags: 0`;
    document.querySelector('.lives').innerText = `Lives: 3`;
    gIsFirstClick = false;
    renderBoard()
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.size; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.size; j++) {
            board[i][j] = {
                isShown: false,
                isMine: false,
                isMarked: false,
                i: i,
                j: j
            }
        }
    }
    spreadMines(board)
    armBoard(board)
    return board;
}
function spreadMines(board) {
    var cells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            cells.push({ i: i, j: j })
        }
    }
    for (var i = 0; i < gLevel.mines; i++) {
        var idx = getRandomInt(0, cells.length)
        var currCell = (cells.splice(idx, 1)).pop()
        board[currCell.i][currCell.j].isMine = true;
    }
}

function setMinesNegsCount(board, row, coll) {
    var mineCount = 0
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = coll - 1; j <= coll + 1; j++) {
            if (j < 0 || j > board[i].length - 1) continue;
            if (board[i][j].isMine) {
                mineCount++
            }
        }
    }
    if (!mineCount) mineCount = '';
    return mineCount;
}

function renderBoard() {
    var strHTML = '<tbody>';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < gBoard[i].length; j++) {
            var currCell = gBoard[i][j];
            var cellVal = '';
            if (currCell.isShown) {
                cellVal = (currCell.isMine) ? MINE : currCell.minesAroundCount
            }
            strHTML += `<td class="cell covered" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j}); return false;">${cellVal} </td>`
        }
        strHTML += '</tr>';
    }
    strHTML += '</tbody>';
    document.querySelector('.game-board').innerHTML = strHTML;
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return;
    var currCell = gBoard[i][j];
    if (!gIsFirstClick) {
        gIsFirstClick = true;
        if (currCell.isMine) {
            var nextCell = getEmptyCell(i, j);
            currCell.isMine = false;
            nextCell.isMine = true;
        }
        startClock()
    }
    if (currCell.isMarked) return;
    currCell.isShown = true;
    elCell.classList.remove('covered')
    renderCell(elCell, i, j)
    gGame.shownCount++
    if (currCell.isMine) {
        gGame.lives--
        document.querySelector('.lives').innerText = `Lives: ${gGame.lives}`
        if (gGame.lives === 0) gameOver()
        else {
            if (isGameOver()) gameOver()
        }
    }
}
function armBoard(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(board, i, j)
        }
    }
}


function cellMarked(elCell, i, j) {
    if (!gGame.isOn) return;
    if (gBoard[i][j].isShown) return;
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked;
    var cellVal
    if (gBoard[i][j].isMarked) {
        gGame.markedCount++
        cellVal = FLAG;
    } else {
        gGame.markedCount--
        cellVal = ''
    }
    elCell.innerHTML = cellVal;
    document.querySelector('.flag-counter').innerText = `Flags: ${gGame.markedCount}`;
    if (isGameOver()) gameOver();
}
//Game ends when all mines are marked, and all the other cells are shown
function isGameOver() {
    return ((gGame.markedCount + gGame.shownCount) === gLevel.size ** 2) ? true : false;
}
//When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors.
function expandShown(board, elCell, i, j) {

}

function gameOver() {
    gGame.isOn = false;
    clearInterval(gClockInterval);

}

function changeDifficulty(size, mines) {
    gLevel = {
        size: size,
        mines: mines,
    }
    init();
}
