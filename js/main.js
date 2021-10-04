'use strict'

const MINE = '<img class="mine-pic" src="img/mine.png">'
const FLAG = '<span class="flag">🚩</span>'
console.log(MINE);
var gBoard;
var gLevel = {
    size: 4,
    mines: 2
}
var gGame;
var gIsFirstClick = false;
var gIdx = 0

//This is called when page loads
function init() {
    clearInterval(gClockInterval)
    document.querySelector('.clock').innerText = '00:00'
    gIsFirstClick = false;
    gBoard = buildBoard()
    renderBoard()
    console.log(gBoard);
}

// Builds the board 
// Set mines at random locations 
// Call setMinesNegsCount() 
// Return the created board
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
    console.log(board);

}
//Count mines around each cell and set the cell's minesAroundCount.
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
//Render the board as a <table> to the page
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
//Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
    if (!gIsFirstClick) {
        gIsFirstClick = true;
        if (gBoard[i][j].isMine) {
            var nextCell = getEmptyCell(i, j);
            gBoard[i][j].isMine = false;
            nextCell.isMine = true;
        }
        startClock()
    }
    elCell.classList.remove('covered')
    var currCell = gBoard[i][j];
    if (currCell.isMarked) return;
    currCell.isShown = true;
    renderCell(elCell, i, j)
}
function armBoard(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(board, i, j)
        }
    }
}

//Called on right click to mark a cell (suspected to be a mine) Search the web (and implement) how to hide the context menu on right click
function cellMarked(elCell, i, j) {
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked;
    if (gBoard[i][j].isMarked) {
        var cellVal = FLAG;
        elCell.innerHTML = cellVal;
    }
}
//Game ends when all mines are marked, and all the other cells are shown
function checkGameOver() {

}
//When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors.
function expandShown(board, elCell, i, j) {

}