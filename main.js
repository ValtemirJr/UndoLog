const { read } = require('fs');
const createTableFromMetadata = require('./scripts/createTableFromMetadata');
const connectToDatabase = require('./scripts/dbConnect');
const readLog = require('./scripts/readLog');

async function main() {
  let client; // Variável para armazenar a conexão com o banco de dados

  try {
    client = await connectToDatabase(); // Conecta com o banco de dados

    await client.query('BEGIN');

    // Cria a tabela e insere os valores iniciais a partir do arquivo metadata.json
    await createTableFromMetadata(client);

    readLog();

    await client.query('COMMIT');
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Erro durante a execução:', error);
  } finally {
    if (client) {
      await client.end(); // Encerra a conexão com o banco de dados
    }
  }
}

main();
