const db = require('./db');

// Exemplo de consulta SQL
const insertQuery = `
  INSERT INTO test (test) VALUES ('Isso eh um teste');
`;
const selectQuery = 'SELECT * FROM test';

// Executa a consulta
db.query(insertQuery)
  .then(() => console.log('Dados inseridos com sucesso!'))
  .catch(err => console.error('Erro ao inserir dados:', err.stack));

// Executa a consulta
db.query(selectQuery)
  .then(res => console.log(res.rows))
  .catch(err => console.error('Erro ao consultar:', err.stack));
