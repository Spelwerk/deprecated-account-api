const accessTokenResponse = require('../components/accessToken/accessTokenResponse');
const logoutResponse = require('../components/logout/logoutResponse');

module.exports = (router) => {
    router.route('/')
        .get(async (req, res, next) => {
            await accessTokenResponse.getToken(req, res, next);
        });

    router.route('/info')
        .get(async (req, res, next) => {
            await accessTokenResponse.getInfo(req, res, next);
        });

    router.route('/logout')
        .post(async (req, res, next) => {
            await logoutResponse.logout(req, res, next);
        });
};
