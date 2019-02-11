const accountSQL = require('./accountSQL');

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const postAccount = async (req, res, next) => {
    try {
        const result = await accountSQL.insertAccount(req.body.email);
        res.status(201).send(result);
    } catch (err) {
        return next(err);
    }
};

const putAccount = async (req, res, next, accountId) => {
    try {
        await accountSQL.updateAccount(accountId, req.account.id, req.body);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

const deleteAccount = async (req, res, next, accountId) => {
    try {
        await accountSQL.deleteAccount(accountId, req.account.id, req.account.roles);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

const getRoot = async (req, res, next) => {
    try {
        const result = await accountSQL.selectAccount([ 'id', 'display_name' ], { deleted: false }, false);
        res.status(200).send(result);
    } catch (err) {
        return next(err);
    }
};

const getId = async (req, res, next, accountId) => {
    try {
        const result = await accountSQL.selectAccount([ 'id', 'is_locked', 'display_name', 'created', 'updated' ], { deleted: false, id: accountId }, true);
        res.status(200).send(result);
    } catch (err) {
        return next(err);
    }
};

const setDisplayName = async (req, res, next, accountId) => {
    try {
        await accountSQL.setDisplayName(accountId, req.account.id, req.body.displayName);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

// ////////////////////////////////////////////////////////////////////////////////// //
// EXPORTS
// ////////////////////////////////////////////////////////////////////////////////// //

module.exports = {
    postAccount,
    putAccount,
    deleteAccount,
    getRoot,
    getId,
    setDisplayName,
};
