const refreshTokenSQL = require('./refreshTokenSQL');

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const getTokens = async (req, res, next) => {
    try {
        const results = await refreshTokenSQL.getTokens(req.account.id);
        res.status(200).send({ results });
    } catch (err) {
        return next(err);
    }
};

const putToken = async (req, res, next, uuid) => {
    try {
        await refreshTokenSQL.setName(req.account.id, uuid, req.body.name);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

const deleteToken = async (req, res, next, uuid) => {
    try {
        await refreshTokenSQL.revokeToken(req.account.id, uuid);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

// ////////////////////////////////////////////////////////////////////////////////// //
// EXPORTS
// ////////////////////////////////////////////////////////////////////////////////// //

module.exports = {
    getTokens,
    putToken,
    deleteToken,
};
