'use strict'
var gStartTime;
var gClockInterval;

function renderCell(el, i, j) {
    var cellVal = (gBoard[i][j].isMine) ? MINE : gBoard[i][j].minesAroundCount
    el.innerHTML = cellVal;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function getEmptyCell(i, j) {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (!gBoard[i][j].isMine) return gBoard[i][j]
        }
    }
}

function startClock() {
    gStartTime = Date.now()
    gClockInterval = setInterval(runningClock, 100)
}

function runningClock() {
    var elClock = document.querySelector('.clock')
    var sec = Math.floor((Date.now() - gStartTime) / 1000)
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
