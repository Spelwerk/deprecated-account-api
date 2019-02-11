const refreshTokenResponse = require('../components/refreshToken/refreshTokenResponse');

module.exports = (router) => {
    router.route('/refresh')
        .get(async (req, res, next) => {
            await refreshTokenResponse.getTokens(req, res, next);
        });

    router.route('/refresh/:uuid')
        .put(async (req, res, next) => {
            await refreshTokenResponse.putToken(req, res, next, req.params.uuid);
        })
        .delete(async (req, res, next) => {
            await refreshTokenResponse.deleteToken(req, res, next, req.params.uuid);
        });
};
