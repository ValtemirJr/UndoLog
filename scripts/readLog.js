const fs = require('fs');

// Define expressões regulares para cada tipo de linha
const regexTransacao = /<T\d+,\d+, .+,\d+>/;
const regexStart = /<start T\d+>/;
const regexCommit = /<commit T\d+>/;
const regexCkpt = /<START CKPT\(T\d+\)>/;
const regexEndCkpt = /<END CKPT>/;

const listaTransacoesSemCommit = [];
const listaStartSemCommitESemTransacao = [];

function readLog() {
    const log = fs.readFileSync('./dataFiles/entryLog.txt', 'utf-8');
    const logArray = log.split('\n');
    logArray.reverse();

// Percorre as linhas e identifica o tipo de cada uma
for (const linha of logArray) { 
    // Se a linha for de transação, verifica se ela possui commit
    if (regexTransacao.test(linha)) {
        const transacao = linha.match(/<T(\d+),/)[1]; // Extrai o número da transação
        const commitEncontrado = logArray.some((l) => regexCommit.test(l) && l.includes(`T${transacao}`));
        if (!commitEncontrado) {
            listaTransacoesSemCommit.push(linha);
        }
    // Se a linha for de start, verifica se ela possui commit
    } else if (regexStart.test(linha)) {
        const transacao = linha.match(/<start T(\d+)>/)[1]; // Extrai o número da transação
        const commitEncontrado = logArray.some((l) => regexCommit.test(l) && l.includes(`T${transacao}`));
        const transacaoEncontrada = logArray.some((l) => regexTransacao.test(l) && l.includes(`T${transacao}`));
        if (!commitEncontrado && !transacaoEncontrada) {
            listaStartSemCommitESemTransacao.push(linha);
        }
    } else {
      continue;
    }
  }

  for (const index of listaStartSemCommitESemTransacao) {
    console.log(`Transação ${index.match(/<start (T\d+)>/)[1]} realizou UNDO`);
  }
  for (const index of listaTransacoesSemCommit) {
    console.log(`Transação T${index.match(/<T(\d+),/)[1]} realizou UNDO`);
  }
}

module.exports = readLog;