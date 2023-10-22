// Conecta ao banco de dados
const db = require('./scripts/db_connect');

// Carrega os arquivos de dados
const json = require('./dataFiles/metadata.json');
const log = require('./dataFiles/entryLog.txt');

// Insere os dados no banco de dados
