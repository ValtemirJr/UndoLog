const fs = require('fs');

function readLog() {
    const log = fs.readFileSync('./dataFiles/entryLog.txt', 'utf-8');
    const logArray = log.split('\n');
    // inverter array
    logArray.reverse();
    console.log(logArray);
}

module.exports = readLog;