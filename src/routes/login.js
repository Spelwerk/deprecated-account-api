const loginResponse = require('../components/login/loginResponse');

module.exports = (router) => {
    router.route('/send')
        .post(async (req, res, next) => {
            await loginResponse.sendEmail(req, res, next);
        });

    router.route('/secret')
        .post(async (req, res, next) => {
            await loginResponse.validateLoginSecret(req, res, next);
        });

    router.route('/password')
        .post(async (req, res, next) => {
            await loginResponse.withPassword(req, res, next);
        });
};
