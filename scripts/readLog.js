const fs = require("fs");
const connectToDatabase = require("./dbConnect");

// Define expressões regulares para cada tipo de linha
const regexTransacao = /<T\d+,\d+, .+,\d+>/;
const regexStart = /<start T\d+>/;
const regexCommit = /<commit T\d+>/;
const regexCkpt = /<START CKPT\(T\d+\)>/;
const regexEndCkpt = /<END CKPT>/;

const listaTransacoesSemCommit = [];
const listaStartSemCommitESemTransacao = [];
const transacoesJaImpressas = new Set(); // Conjunto para acompanhar transações impressas
let achouEndPoint = false;

async function readLog() {
  const log = fs.readFileSync("./dataFiles/entryLog.txt", "utf-8");
  const logArray = log.split("\n");
  logArray.reverse();

  // Percorre as linhas e identifica o tipo de cada uma
  for (const linha of logArray) {
    // Se a linha for de transação, verifica se ela possui commit
    if (regexTransacao.test(linha)) {
      const transacao = linha.match(/<T(\d+),/)[1]; // Extrai o número da transação
      const commitEncontrado = logArray.some(
        (l) => regexCommit.test(l) && l.includes(`T${transacao}`)
      );
      if (!commitEncontrado && !transacoesJaImpressas.has(transacao)) {
        listaTransacoesSemCommit.push(linha);
        transacoesJaImpressas.add(transacao); // Adiciona à lista de transações impressas
      }
      // Se a linha for de start, verifica se ela possui commit
    } else if (regexStart.test(linha)) {
      const transacao = linha.match(/<start T(\d+)>/)[1]; // Extrai o número da transação
      const commitEncontrado = logArray.some(
        (l) => regexCommit.test(l) && l.includes(`T${transacao}`)
      );
      const transacaoEncontrada = logArray.some(
        (l) => regexTransacao.test(l) && l.includes(`T${transacao}`)
      );
      if (
        !commitEncontrado &&
        !transacaoEncontrada &&
        !transacoesJaImpressas.has(transacao)
      ) {
        listaStartSemCommitESemTransacao.push(linha);
        transacoesJaImpressas.add(transacao); // Adiciona à lista de transações impressas
      }
    } else if(regexCkpt.test(linha) && achouEndPoint) {
      break;
    } else if(regexEndCkpt.test(linha)) {
      achouEndPoint = true;
    } else {
      continue;
    }
  }

  for (const index of listaStartSemCommitESemTransacao) {
    console.log(`Transação ${index.match(/<start (T\d+)>/)[1]} realizou UNDO`);
  }
  for (const index of listaTransacoesSemCommit) {
    // Extrai os valores da transação
    const valores = index
      .match(/<.+>/)[0]
      .match(/[^<>, ]+/g)
      .slice(1);
    try {
      const db = await connectToDatabase();
      // Executa o UNDO
      const undo = `UPDATE undefined SET ${valores[1]} = ${valores[2]} WHERE id = ${valores[0]};`;
      await db.query(undo);
      console.log(`Transação T${index.match(/<T(\d+),/)[1]} realizou UNDO`);
    } catch (error) {
      console.error("Erro ao realizar UNDO:", error);
    }
  }
}

module.exports = readLog;
