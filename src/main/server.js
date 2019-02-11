require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const userAgent = require('express-useragent');
const nconf = require('nconf');
const initializers = require('../initializers/index');
const middleware = require('../middleware/index');
const logger = require('../utils/logger');

const init = async (rootFolder) => {
    try {
        if (!process.env.NODE_ENV) {
            throw new Error('Environment variable NODE_ENV is missing');
        }

        if (!process.env.LOG_LEVEL) {
            throw new Error('Environment variable LOG_LEVEL is missing');
        }

        const app = express();

        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(userAgent.express());

        // Initializing nconf configuration
        initializers.config.init(rootFolder);

        // Initializing utility services
        initializers.encryption.init();
        initializers.jwt.init();
        initializers.mailer.init();

        // Initializing database service
        await initializers.database.init();

        // Initializing middleware for request logs
        middleware.requestLog.init(app);

        // Initializing user authentication based on tokens in header
        middleware.auth.init(app);

        // Initializing routes automatically from the folder /routes
        await initializers.router.init(app);

        // Initializing error catcher which will send a formatted response on all errors
        middleware.onErrorResponse.init(app);

        // Initializing 404 response
        middleware.onRouteNotFoundResponse.init(app);

        const { host, port } = nconf.get().server;
        app.listen(port, host);
        logger.info(`RUNNING [ http://${host}:${port} ] ENV [ ${process.env.NODE_ENV} ] LEVEL [ ${process.env.LOG_LEVEL} ]`);

        return true;
    } catch (err) {
        console.error(err); // eslint-disable-line no-console
        process.exit(1);
    }
};

module.exports = { init };
