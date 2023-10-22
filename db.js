const { Client } = require('pg');
require('dotenv').config(); // Carrega variáveis de ambiente a partir do arquivo .env

// Configuração da conexão com o banco de dados
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
};

// Cria um novo cliente PostgreSQL
const client = new Client(dbConfig);

// Conecta ao banco de dados
client.connect()
  .then(() => console.log('Conectado ao banco de dados'))
  .catch(error => console.error('Erro na conexão:', error));

// Exporte o cliente para usá-lo em outros arquivos
module.exports = client;
