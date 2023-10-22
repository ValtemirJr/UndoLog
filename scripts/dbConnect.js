const { Client } = require('pg');
require('dotenv').config(); // Carrega variáveis de ambiente a partir do arquivo .env

// Configuração da conexão com o banco de dados
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

// Função para conectar ao banco de dados
async function connectToDatabase() {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    console.log('Conectado ao banco de dados');
    return client;
  } catch (error) {
    console.error('Erro na conexão:', error);
    throw error;
  }
}

module.exports = connectToDatabase;
