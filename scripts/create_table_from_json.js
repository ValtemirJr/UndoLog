const fs = require('fs');

// Read the file
fs.readFile('path/to/file.json', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Do something with the data
    console.log(jsonData);
});
