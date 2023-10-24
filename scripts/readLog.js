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

  // Inverte o array para percorrer do final para o início
  logArray.reverse();

  // Percorre as linhas e identifica o tipo de cada uma
  for (const linha of logArray) {
    // Se a linha for de transação, verifica se ela possui commit
    if (regexTransacao.test(linha)) {
      const transacao = linha.match(/<T(\d+),/)[1]; // Extrai o número da transação
      const commitEncontrado = logArray.some( // Busca por um commit que contenha o número da transação
        (l) => regexCommit.test(l) && l.includes(`T${transacao}`)
      );
      // Se a transação não possui commit e ainda não foi impressa, adiciona à lista
      if (!commitEncontrado && !transacoesJaImpressas.has(transacao)) {
        listaTransacoesSemCommit.push(linha);
        transacoesJaImpressas.add(transacao); // Adiciona à lista de transações impressas
      }
      // Se a linha for de start, verifica se ela possui commit
    } else if (regexStart.test(linha)) {
      const transacao = linha.match(/<start T(\d+)>/)[1]; // Extrai o número da transação
      const commitEncontrado = logArray.some( // Busca por um commit que contenha o número da transação
        (l) => regexCommit.test(l) && l.includes(`T${transacao}`)
      );
      const transacaoEncontrada = logArray.some( // Busca a transação no log
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
      // Se a linha for de checkpoint e já tiver encontrado o end checkpoint, para a execução
    } else if(regexCkpt.test(linha) && achouEndPoint) {
      break;
      // Se a linha for de end checkpoint, marca que encontrou o end checkpoint
    } else if(regexEndCkpt.test(linha)) {
      achouEndPoint = true;
      // Continua o loop para satisfazer próximas condições do UNDO
    } else {
      continue;
    }
  }

  // Imprime os resultados do UNDO para log <start TX> sem commit
  for (const index of listaStartSemCommitESemTransacao) {
    console.log(`Transação ${index.match(/<start (T\d+)>/)[1]} realizou UNDO`);
  }

  // Realiza o UNDO para log <TX, id, coluna, valor antigo> sem commit
  for (const index of listaTransacoesSemCommit) {
    // Extrai os valores da transação no formato [id, coluna, valor antigo]
    const valores = index
      .match(/<.+>/)[0]
      .match(/[^<>, ]+/g)
      .slice(1);
    try {
      const db = await connectToDatabase();
      // Executa o UNDO                     // Coluna        // Valor                 // ID
      const undo = `UPDATE undefined SET ${valores[1]} = ${valores[2]} WHERE id = ${valores[0]};`;
      await db.query(undo);
      // Imprime o resultado do UNDO
      console.log(`Transação T${index.match(/<T(\d+),/)[1]} realizou UNDO`);

      // Encerra a conexão com o banco de dados
      await db.end();
      
    } catch (error) {
      console.error("Erro ao realizar UNDO:", error);
    }
  }
}

module.exports = readLog;
