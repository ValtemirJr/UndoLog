const connectToDatabase = require('./dbConnect');
const metadata = require('../dataFiles/metadata.json');

async function createTableFromMetadata() {
  try {
    const db = await connectToDatabase();
    const { table } = metadata;
    
    // Monta a definição da tabela com base no JSON
    const tableColumns = Object.keys(table).map((columnName) => `${columnName} INT`);
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${table.table_name} (
        ${tableColumns.join(', ')}
      );
    `;
    
    await db.query(createTableSQL);
    console.log('Tabela criada com sucesso.');

    // Itera sobre os dados e insere cada tupla
    const columnNames = Object.keys(table).join(', ');
    const insertInitialValuesSQL = `
      INSERT INTO ${table.table_name} (${columnNames})
      VALUES 
      ${table.id.map((id, index) => `(${id}, ${table.A[index]}, ${table.B[index]})`).join(', ')}
    `;

    await db.query(insertInitialValuesSQL);
    console.log('Valores iniciais inseridos com sucesso.');
  } catch (error) {
    console.error('Erro ao criar a tabela e inserir os valores iniciais:', error);
  }
}


module.exports = createTableFromMetadata;