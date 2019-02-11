const util = require('util');
const fs = require('fs');
const path = require('path');
const nconf = require('nconf');
const express = require('express');

const readDir = util.promisify(fs.readdir);
const logger = require('../utils/logger');

const initFile = async (app, root, fileName) => {
    logger.debug(`[ROUTES] router path /${fileName}`);

    const file = require(path.join(root, fileName)); // eslint-disable-line global-require, import/no-dynamic-require

    const router = express.Router();
    file(router);

    app.use(`/${fileName}`, router);
};

const initFolder = async (app, root, folderName) => {
    const files = await readDir(path.join(root, folderName));

    for (const i in files) {
        if (!files.hasOwnProperty(i)) continue;

        const file = path.parse(files[i]);

        if (file.ext === '.js') {
            await initFile(app, root, path.join(folderName, file.name));
        }
    }
};

const init = async (app) => {
    const rootFolder = nconf.get().app.root;
    const root = `${rootFolder}/src/routes`;
    const files = await readDir(root);

    for (const i in files) {
        if (!files.hasOwnProperty(i)) continue;

        const file = path.parse(files[i]);

        if (!file.ext) {
            await initFolder(app, root, file.name);
        } else if (file.ext === '.js') {
            await initFile(app, root, file.name);
        }
    }
};

module.exports = { init };
