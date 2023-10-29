const connectToDatabase = require('./dbConnect');
const metadata = require('../dataFiles/metadata.json');

async function createTableFromMetadata() {
  try {
    const db = await connectToDatabase();
    const { table } = metadata;

    table.table_name = 'log';

    // Dropa a tabela se ela já existir
    await db.query(`DROP TABLE IF EXISTS ${table.table_name};`);

    // Monta a definição da tabela com base no JSON
    const tableColumns = Object.keys(table).map((columnName) => `${columnName} INT`);

    // Remove o atributo table_name do objeto table
    tableColumns.pop();

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${table.table_name} (
        ${tableColumns.join(', ')}
      );
    `;

    console.log(createTableSQL);
    await db.query(createTableSQL);

    // Remove o atributo table_name do objeto table
    delete table.table_name;

    // Itera sobre os dados e insere cada tupla
    const columnNames = Object.keys(table).join(', ');
    console.log(columnNames);

    console.log(table);
    
    const numRows = Math.max(...Object.values(table).map(arr => arr.length));

    const insertValues = Array.from({ length: numRows }, (_, index) => {
      const rowValues = Object.keys(table).map(columnName => {
        const value = table[columnName][index];
        return value !== undefined ? value : 'NULL';
      });
      return `(${rowValues.join(', ')})`;
    });

    const insertInitialValuesSQL = `
      INSERT INTO log (${columnNames})
      VALUES 
        ${insertValues.join(', ')}
    `;

    console.log(insertInitialValuesSQL);

    await db.query(insertInitialValuesSQL);

    await db.end();
  } catch (error) {
    console.error('Erro ao criar a tabela e inserir os valores iniciais:', error);
    await db.end();
  }
}


module.exports = createTableFromMetadata;