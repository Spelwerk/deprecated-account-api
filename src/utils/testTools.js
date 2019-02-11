const util = require('util');
const fs = require('fs');
const path = require('path');
const nconf = require('nconf');
const logger = require('../utils/logger');

const writeFile = util.promisify(fs.writeFile);

const saveTextToFile = async (text, file) => {
    const rootFolder = nconf.get().app.root;
    const environment = process.env.NODE_ENV;

    if (environment === 'production') return;

    const directory = `${rootFolder}/tests/`;
    await writeFile(path.join(directory, file), text, 'utf8');

    logger.debug('saved text:', text, 'to file:', file);
};

const saveHashToTestFile = async (hash) => {
    await saveTextToFile(hash, 'secret');
};

module.exports = {
    saveTextToFile,
    saveHashToTestFile,
};
