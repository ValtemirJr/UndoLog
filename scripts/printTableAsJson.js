const connectToDatabase = require('./dbConnect');
const metadata = require('../dataFiles/metadata.json');

async function printTableAsJson() {
    // Formata o JSON para comparação
    let jsonMetadata = metadata.table;

    // Conecta com o banco de dados e busca os dados da tabela pós-UNDO
    const db = await connectToDatabase();
    const { rows } = await db.query('SELECT * FROM undefined ORDER BY id;');
    
    // Inicializa um objeto para conter os dados formatados
    const formattedData = {
        id: [],
        A: [],
        B: []
    };

    // Percorre as linhas da consulta e adiciona os valores formatados ao objeto
    rows.forEach(row => {
        formattedData.id.push(row.id);
        formattedData.A.push(row.a);
        formattedData.B.push(row.b);
    }); // <-- added closing parenthesis here

    // Compara os objetos e imprime os valores que não sofreram UNDO
    const jsonMetadataKeys = Object.keys(jsonMetadata);

    for (let i = 0; i < jsonMetadataKeys.length; i++) {
        const key = jsonMetadataKeys[i];
        const jsonMetadataValues = jsonMetadata[key];
        const formattedDataValues = formattedData[key];

        for (let j = 0; j < jsonMetadataValues.length; j++) {
            if (jsonMetadataValues[j] == formattedDataValues[j]) {
                if (key == 'id') continue;
                process.stdout.write(`${formattedDataValues[j]}, `);
            }
        }
    }

    process.stdout.write('são os novos valores\n');

    // Encerra a conexão com o banco de dados
    await db.end();
}

module.exports = printTableAsJson;
