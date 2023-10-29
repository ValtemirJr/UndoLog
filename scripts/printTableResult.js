const connectToDatabase = require('./dbConnect');
const metadata = require('../dataFiles/metadata.json');

async function printTableResult() {
    // Formata o JSON para comparação
    const jsonMetadata = metadata.table;

    // Conecta com o banco de dados e busca os dados da tabela pós-UNDO
    const db = await connectToDatabase();
    const { rows } = await db.query('SELECT * FROM log ORDER BY id;');

    // Inicializa um objeto para conter os dados formatados
    const formattedData = {};

    // Inicializa o objeto formattedData com as chaves do jsonMetadata
    for (const key in jsonMetadata) {
        formattedData[key] = [];
    }

    // Percorre as linhas da consulta e adiciona os valores formatados ao objeto
    rows.forEach(row => {
        for (const key in jsonMetadata) {
            const value = row[key.toLowerCase()];
            if (value !== null) {
                formattedData[key].push(value);
            }
        }
    });

    // Imprime os valores que não sofreram UNDO em uma única linha
    const nonNullValues = [];
    for (const key in jsonMetadata) {
        if (key === 'id') continue;
        nonNullValues.push(`${formattedData[key].join(', ')}`);
    }

    process.stdout.write(`${nonNullValues.join(', ')} são os novos valores\n`);

    // Encerra a conexão com o banco de dados
    await db.end();
}

module.exports = printTableResult;
