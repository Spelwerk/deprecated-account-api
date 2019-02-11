const accountResponse = require('../components/account/accountResponse');

module.exports = (router) => {
    router.route('/')
        .get(async (req, res, next) => {
            await accountResponse.getRoot(req, res, next);
        })
        .post(async (req, res, next) => {
            await accountResponse.postAccount(req, res, next);
        });

    router.route('/:id')
        .get(async (req, res, next) => {
            await accountResponse.getId(req, res, next, req.params.id);
        });
};
