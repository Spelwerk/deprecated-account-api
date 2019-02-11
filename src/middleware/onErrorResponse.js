const logger = require('../utils/logger');

const init = (app) => {
    app.use((err, req, res, next) => {
        if (!err) {
            return next();
        }

        err.uuid = req.log.uuid;
        err.status = err.status || 500;
        err.name = err.name || 'Error';
        err.title = err.title || 'Error';
        err.details = err.details || 'An error has occured on the server';
        err.message = err.message || null;

        req.log.error = err;

        if (process.env.NODE_ENV !== 'production') {
            console.error(err); // eslint-disable-line no-console
        } else {
            logger.debug(req.log);
            logger.error(err);
        }

        res.status(err.status).send(err);
    });
};

module.exports = { init };
