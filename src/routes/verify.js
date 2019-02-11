const verifyAccountResponse = require('../components/verifyAccount/verifyAccountResponse');

module.exports = (router) => {
    router.route('/send')
        .post(async (req, res, next) => {
            await verifyAccountResponse.sendEmail(req, res, next);
        });

    router.route('/secret')
        .post(async (req, res, next) => {
            await verifyAccountResponse.verifyAccount(req, res, next);
        });
};
