const connectToDatabase = require('./dbConnect');
const metadata = require('../dataFiles/metadata.json');

async function createTableFromMetadata() {
  try {
    const db = await connectToDatabase();
    const { table } = metadata;

    // Dropa a tabela se ela já existir
    await db.query(`DROP TABLE IF EXISTS ${table.table_name};`);
    
    // Monta a definição da tabela com base no JSON
    const tableColumns = Object.keys(table).map((columnName) => `${columnName} INT`);
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${table.table_name} (
        ${tableColumns.join(', ')}
      );
    `;
    
    await db.query(createTableSQL);

    // Itera sobre os dados e insere cada tupla
    const columnNames = Object.keys(table).join(', ');
    const insertInitialValuesSQL = `
      INSERT INTO ${table.table_name} (${columnNames})
      VALUES 
        ${table.id.map((id, index) => `(${Object.values(table).map((column) => column[index]).join(', ')})`).join(', ')}
    `;

    await db.query(insertInitialValuesSQL);
  } catch (error) {
    console.error('Erro ao criar a tabela e inserir os valores iniciais:', error);
  }
}


module.exports = createTableFromMetadata;