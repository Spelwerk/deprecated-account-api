const verifyExistsResponse = require('../components/verifyExists/verifyExistsResponse');

module.exports = (router) => {
    router.route('/display-name/:name')
        .get(async (req, res, next) => {
            await verifyExistsResponse.displayNameExists(req, res, next, req.params.name);
        });

    router.route('/email/:email')
        .get(async (req, res, next) => {
            await verifyExistsResponse.emailExists(req, res, next, req.params.email);
        });
};
