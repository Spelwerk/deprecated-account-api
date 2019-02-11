const _ = require('lodash');
const { common, randomHash } = require('spelwerk-service-utility');
const { FilteredLogKeys } = require('../constants');
const logger = require('../utils/logger');

const { contains } = common;
const { uuid } = randomHash;

const init = (app) => {
    app.use((req, res, next) => {
        req.useragent.remoteAddress = req.connection.remoteAddress;

        req.log = {
            uuid: uuid(),
            host: req.headers.host,
            userAgent: req.useragent,
            method: req.method,
            url: req.url,
            body: {},
        };

        _.forEach(req.body, (item, key) => {
            if (contains(FilteredLogKeys, key)) return;
            req.log.body[key] = item;
        });

        logger.silly(req.log);

        next();
    });
};

module.exports = { init };
