const util = require('util');
const fs = require('fs');
const path = require('path');

const readFile = util.promisify(fs.readFile);

const getSecretFromFile = async () => {
    return readFile(path.join(__dirname, 'secret'), 'utf8');
};

module.exports = {
    getSecretFromFile,
};
