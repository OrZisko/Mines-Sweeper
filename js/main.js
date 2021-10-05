'use strict'
var gUserBestScore;

const MINE = '<img class="mine-img" src="img/mine.png">'
const FLAG = '<span class="flag">🚩</span>'
const HINT = '💡'
const SAFE = '⛏️'
var gIdx = 1
var gBoard;
var gLevel = {
    size: 4,
    mines: 2
}
var gDifficulty;
var gGame
var gPast = [];

var gIsFirstClick = false;
var gIsHint = false;
var gIsSafe = false;
var gIs7Boom = false;

function init() {
    gIdx = 1;
    checkUserScore()
    clearInterval(gClockInterval)
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3,
        hints: 3,
        safe: 3,
    }
    gBoard = buildBoard()
    gIs7Boom = false;
    renderSymbolAmount(gGame.hints, HINT);
    renderSymbolAmount(gGame.safe, SAFE);
    document.querySelector('.clock').innerText = '00:00'
    document.querySelector('.flag-counter').innerText = `Flags: 0`;
    document.querySelector('.lives').innerText = `Lives: 3`;
    gIsFirstClick = false;
    renderBoard()
    console.log(gBoard);
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
                j: j,
                idx: gIdx++
            }
        }
    }
    spreadMines(board)
    return board;
}
function spreadMines(board) {
    if (gIs7Boom) {
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board[i].length; j++) {
                if (checkIf7(board[i][j].idx)) board[i][j].isMine = true;
            }
        }
    } else {
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
}

function setMinesNegsCount(board, row, coll) {
    var mineCount = 0
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = coll - 1; j <= coll + 1; j++) {
            if (j < 0 || j > board[i].length - 1 || (i === row && j === coll)) continue;
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
            strHTML += `<td class="cell cell${i}-${j} covered" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j}); return false;">${cellVal} </td>`
        }
        strHTML += '</tr>';
    }
    strHTML += '</tbody>';
    document.querySelector('.game-board').innerHTML = strHTML;
}

function cellClicked(elCell, i, j) {
    var currCell = gBoard[i][j];
    if (gIsHint) {
        hint(i, j);
        gIsHint = false;
        return;
    }
    if (currCell.isMarked) return;
    if (!gGame.isOn) return;
    if (currCell.isShown) return;
    if (!gIsFirstClick) {
        gIsFirstClick = true;
        if (currCell.isMine) {
            var nextCell = getEmptyCell();
            currCell.isMine = false;
            nextCell.isMine = true;
            currCell.minesAroundCount = setMinesNegsCount(gBoard, i, j)
        }
        armBoard(gBoard)
        startClock()
    }
    if (gIsSafe) {
        document.querySelector('.halo').classList.remove('halo')
        gIsSafe = false;
    }
    gPast.push([currCell]);
    currCell.isShown = true;
    renderCell(i, j)
    gGame.shownCount++
    if (currCell.isMine) {
        gGame.lives--
        document.querySelector('.lives').innerText = `Lives: ${gGame.lives}`
        if (gGame.lives === 0) gameOver()
    } else {
        if (!currCell.minesAroundCount) expandShown(i, j)
    }
    if (isGameOver()) gameOver()
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
function expandShown(row, coll) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = coll - 1; j <= coll + 1; j++) {
            if (j < 0 || j >= gBoard[i].length || (i === row && j === coll)) continue;
            else if (!gBoard[i][j].isShown) {
                gPast[gPast.length - 1].push(gBoard[i][j])
                gBoard[i][j].isShown = true;
                gGame.shownCount++
                renderCell(i, j)
                if (!gBoard[i][j].minesAroundCount) expandShown(i, j)
                if (isGameOver()) gameOver()
            }
        }
    }
}

function gameOver() {
    var smily = document.querySelector('.smily')
    if (gGame.lives === 0) smily.innerText = '😱'
    else smily.innerText = '😎'
    gGame.isOn = false;
    clearInterval(gClockInterval);
    if (!gUserBestScore || gTime < gUserBestScore) {
        localStorage.setItem(`${gDifficulty}BestScore`, gTime)
        document.querySelector('.best-score').innerText = `Best Score: ${gTime}`;
    }
}

function changeDifficulty(size, mines) {

    gLevel = {
        size: size,
        mines: mines,
    }
    init();
}

function getHint() {
    if (gGame.hints > 0)
        gIsHint = true;
    gGame.hints--
    renderSymbolAmount(gGame.hints, HINT)
}
function hint(row, coll) {
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = coll - 1; j <= coll + 1; j++) {
            if (j < 0 || j > gBoard[i].length - 1) continue;
            if (gBoard[i][j].isShown) continue;
            gBoard[i][j].isShown = true;
            renderCell(i, j)
        }
    }
    setTimeout(function () {
        for (var i = row - 1; i <= row + 1; i++) {
            if (i < 0 || i > gBoard.length - 1) continue;
            for (var j = coll - 1; j <= coll + 1; j++) {
                if (j < 0 || j > gBoard[i].length - 1) continue;
                if (!gBoard[i][j].isShown) continue;
                gBoard[i][j].isShown = false;
                renderCell(i, j)
            }
        }
    }, 1000)
}

function checkUserScore() {
    switch (gLevel.size) {
        case (4):
            gDifficulty = 'easy';
            break;
        case (8):
            gDifficulty = 'normal';
            break;
        case (12):
            gDifficulty = 'hard';
            break;
    }
    gUserBestScore = localStorage.getItem(`${gDifficulty}BestScore`)
    if (gUserBestScore) document.querySelector('.best-score').innerText = `Best Score: ${gUserBestScore}`;
    else document.querySelector('.best-score').innerText = '';
}

function getSafe() {
    if (gGame.safe === 0) return;
    gIsSafe = true;
    gGame.safe--
    var safeCell = getEmptyCell()
    var elSafeCell = document.querySelector(`.cell${safeCell.i}-${safeCell.j}`)
    elSafeCell.classList.add('halo');
    renderSymbolAmount(gGame.safe, SAFE)
}

function undo() {
    if (!gGame.isOn) return
    if (gGame.shownCount === 0) return;
    var prevMove = gPast.pop()
    for (var i = 0; i < prevMove.length; i++) {
        prevMove[i].isShown = false;
        gGame.shownCount--
        if (prevMove[i].isMine) {
            gGame.lives++
            document.querySelector('.lives').innerText = `Lives: ${gGame.lives}`
        }
        renderCell(prevMove[i].i, prevMove[i].j)
    }
}

function sevenBoom() {
    gIs7Boom = true;
    document.querySelector('.smily').innerText = '7️⃣'
    init()
}

function checkIf7(idx) {
    var idxStr = '' + idx;
    if (!(idx % 7)) return true;
    for (var i = 0; i < idxStr.length; i++) {
        if (idxStr.charAt(i) === '7') return true;
    }
    return false;
}