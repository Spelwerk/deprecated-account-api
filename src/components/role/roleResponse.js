const roleSQL = require('./roleSQL');

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const getRoles = async (req, res, next, accountId) => {
    try {
        const roles = await roleSQL.selectRoles(accountId);
        res.status(200).send({ roles });
    } catch (err) {
        return next(err);
    }
};

const postRole = async (req, res, next, accountId) => {
    try {
        await roleSQL.insertRole(accountId, req.account.id, req.body.roleId);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

const deleteRole = async (req, res, next, accountId, roleId) => {
    try {
        await roleSQL.deleteRole(accountId, req.account.id, roleId);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    getRoles,
    postRole,
    deleteRole,
};
