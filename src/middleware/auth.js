const { getJWT } = require('../initializers/jwt');
const { TokenKey } = require('../constants');
const logger = require('../utils/logger');

const init = (app) => {
    app.use((req, res, next) => {
        req.account = {
            id: null,
            roles: {},
        };

        req.tokens = {
            accessToken: {},
            refreshToken: {},
        };

        try {
            const jwt = getJWT();
            const accessToken = req.headers[TokenKey.ACCESS] || null;
            const refreshToken = req.headers[TokenKey.REFRESH] || null;

            if (accessToken) {
                logger.debug(`got accessToken in header: ${accessToken}`);

                req.tokens.accessToken = jwt.decodeToken(accessToken);

                req.account.id = req.tokens.accessToken.account.id;
                req.account.roles = req.tokens.accessToken.account.roles;
            }

            if (refreshToken) {
                logger.debug(`got refreshToken in header: ${refreshToken}`);
                req.tokens.refreshToken = jwt.decodeToken(refreshToken);
            }
        } catch (err) {
            return next(err);
        }

        next();
    });
};

module.exports = { init };
