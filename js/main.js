'use strict'
// localStorage Info
var gUserBestScore;
// Symbols
const MINE = '<img class="mine-img" src="img/mine.png">'
const FLAG = '<span class="flag">🚩</span>'
const HINT = '💡'
const SAFE = '⛏️'
// Game Structure
var gBoard;
var gLevel = {
    size: 4,
    mines: 2
}
var gDifficulty;
var gGame
var gPast = [];
var gIdx = 1
var gTime = 0
var gStartTime;
var gClockInterval;
var gIsFirstClick = false;
var gIsHint = false;
var gIsSafe = false;
var gIs7Boom = false;
// Called from the difficulty buttons, with the difficulty's edge and number of mine. reassign the gLevel var accordingly and run the init() func.
function changeDifficulty(size, mines) {

    gLevel = {
        size: size,
        mines: mines,
    }
    init();
}
// Called from the 7BOOM!! button. Turns the gIs7Boom var to true. Changes the smily to a 7, and runs the init() func again.
function sevenBoom() {
    gIs7Boom = true;
    document.querySelector('.smily').innerText = '7️⃣'
    init()
}
// Runs at the first load of the page, and called upon from the difficulty buttons. Adjust the game structure to a starting point.
function init() {
    clearInterval(gClockInterval)
    checkUserScore()
    gIsSafe = false;
    gIsHint = false;
    gIsFirstClick = false;
    gIdx = 1;
    gTime = 0;
    gPast = [];
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
    if (!gIs7Boom) document.querySelector('.smily').innerText = '😁'
    renderSymbolAmount(gGame.hints, HINT);
    renderSymbolAmount(gGame.safe, SAFE);
    document.querySelector('.clock').innerText = '00:00'
    document.querySelector('.flag-counter').innerText = `Flags: 0`;
    document.querySelector('.lives').innerText = `Lives: 3`;
    renderBoard()
    gIs7Boom = false;
    console.log(gBoard);
}
// Called from the init() func. Gives the gDifficulty a value accordingly, if there is a BestScore for the current diff in the localStorage shows it, else informs the user that this is his first game. 
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
    else document.querySelector('.best-score').innerText = 'First Game';
}
// Called from the init() func. returns a matrix, filled with object of details on the cell in every cell.  
function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.size; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.size; j++) {
            board[i][j] = {
                isShown: false,
                isMine: false,
                isMarked: false,
                isHint: false,
                i: i,
                j: j,
                idx: gIdx++
            }
        }
    }
    spreadMines(board)
    return board;
}
// Called from the bui;dBoard() func. Checks if 7 BOOM opts is on, and spread mines accordingly.
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
        if (gTime === 0) startClock()
    }

    if (gIsHint) {
        hint(i, j);
        gIsHint = false;
        return;
    }

    if (gIsSafe) {
        document.querySelector('.halo').classList.remove('halo')
        gIsSafe = false;
    }
    gPast.push([currCell]);
    currCell.isShown = true;
    gGame.shownCount++
    renderCell(i, j)
    if (currCell.isMine) {
        gGame.lives--
        document.querySelector('.lives').innerText = `Lives: ${gGame.lives}`
        if (gGame.lives === 0) {
            for (var i = 0; i < gLevel.size; i++) {
                for (var j = 0; j < gLevel.size; j++) {
                    if (gBoard[i][j].isShown || !gBoard[i][j].isMine) continue;
                    gBoard[i][j].isShown = true;
                    renderCell(i, j)
                }
            }
            gameOver()
        }
    } else {
        (!currCell.minesAroundCount) ? expandShown(i, j) : document.querySelector('.cell-sound').play()
    }
    if (isGameOver()) gameOver()
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

function armBoard(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(board, i, j)
        }
    }
}

function hint(row, coll) {
    var hintedCells = [];
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = coll - 1; j <= coll + 1; j++) {
            if (j < 0 || j > gBoard[i].length - 1) continue;
            if (gBoard[i][j].isShown) continue;
            gBoard[i][j].isShown = true;
            hintedCells.push(gBoard[i][j]);
            renderCell(i, j)
        }
    }
    setTimeout(function () {
        for (var i = 0; i < hintedCells.length; i++) {
            hintedCells[i].isShown = false;
            renderCell(hintedCells[i].i, hintedCells[i].j)
        }
    }, 1000)
}

function expandShown(row, coll) {
    document.querySelector('.cells-sound').play()
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = coll - 1; j <= coll + 1; j++) {
            if (j < 0 || j >= gBoard[i].length || (i === row && j === coll)) continue;
            else if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
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

function cellMarked(elCell, i, j) {
    if (!gIsFirstClick) {
        startClock();
    }
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

function getHint() {
    if (!gIsFirstClick) return;
    if (gGame.hints > 0)
        gIsHint = true;
    gGame.hints--
    renderSymbolAmount(gGame.hints, HINT)
}

function getSafe() {
    if (!gIsFirstClick) return
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

function isGameOver() {
    if (gGame.markedCount > gLevel.mines) return false;
    return ((gGame.markedCount + gGame.shownCount) === gLevel.size ** 2) ? true : false;
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





