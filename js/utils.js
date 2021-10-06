'use strict'

function getEmptyCell() {
    var emptyCells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) emptyCells.push(gBoard[i][j])
        }
    }
    return (emptyCells.splice(getRandomInt(0, emptyCells.length), 1)).pop()
}

function startClock() {
    gStartTime = Date.now()
    gClockInterval = setInterval(runningClock, 100)
}

function renderCell(i, j) {
    var elCell = document.querySelector(`.cell${i}-${j}`)
    elCell.classList.toggle('covered')
    var cellVal = (gBoard[i][j].isMine) ? MINE : gBoard[i][j].minesAroundCount
    if (!gBoard[i][j].isShown) cellVal = ''
    elCell.innerHTML = cellVal;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function runningClock() {
    var elClock = document.querySelector('.clock')
    var sec = Math.floor((Date.now() - gStartTime) / 1000)
    gTime = sec;
    var min;
    if ((sec / 60) >= 1) {
        min = Math.floor(sec / 60)
        sec = sec % 60;
    }
    if (sec < 10) sec = `0${sec}`;
    if (!min) min = '00';
    else {
        if (min < 10) min = `0${min}`;
    }
    elClock.innerText = `${min}:${sec}`
}

function renderSymbolAmount(amount, symbol) {
    var elHints = document.querySelector('.hints-box span')
    var elSafe = document.querySelector('.safe-box span')
    var symbolsStr = ''
    for (var i = 0; i < amount; i++) {
        symbolsStr += symbol;
    }
    switch (symbol) {
        case HINT:
            elHints.innerHTML = symbolsStr;
            break;
        case SAFE:
            elSafe.innerHTML = symbolsStr;
    }
}

function checkIf7(idx) {
    var idxStr = '' + idx;
    if (!(idx % 7)) return true;
    for (var i = 0; i < idxStr.length; i++) {
        if (idxStr.charAt(i) === '7') return true;
    }
    return false;
}