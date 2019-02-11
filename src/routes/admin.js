const changeEmailResponse = require('../components/changeEmail/changeEmailResponse');
const changePasswordResponse = require('../components/changePassword/changePasswordResponse');
const roleResponse = require('../components/role/roleResponse');

module.exports = (router) => {
    router.route('/:id/email')
        .put(async (req, res, next) => {
            await changeEmailResponse.setNewEmailAsAdmin(req, res, next, req.params.id);
        });

    router.route('/:id/password')
        .put(async (req, res, next) => {
            await changePasswordResponse.setNewPasswordAsAdmin(req, res, next, req.params.id);
        });

    router.route('/:id/roles')
        .get(async (req, res, next) => {
            await roleResponse.getRoles(req, res, next, req.params.id);
        })
        .post(async (req, res, next) => {
            await roleResponse.postRole(req, res, next, req.params.id);
        });

    router.route('/:id/roles/:role')
        .delete(async (req, res, next) => {
            await roleResponse.deleteRole(req, res, next, req.params.id, req.params.role);
        });
};
