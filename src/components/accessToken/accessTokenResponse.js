const commonErrors = require('spelwerk-common-errors');
const accessTokenSQL = require('./accessTokenSQL');

const { AccountNotLoggedInError } = commonErrors;

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const getToken = async (req, res, next) => {
    try {
        if (!req.account.id) {
            return next(new AccountNotLoggedInError);
        }

        const session = await accessTokenSQL.createToken(req.tokens.refreshToken.uuid);
        res.status(200).send(session);
    } catch (err) {
        return next(err);
    }
};

const getInfo = async (req, res, next) => {
    try {
        if (!req.account.id) {
            return next(new AccountNotLoggedInError);
        }

        res.status(200).send({ tokens: req.tokens });
    } catch (err) {
        return next(err);
    }
};

// ////////////////////////////////////////////////////////////////////////////////// //
// EXPORTS
// ////////////////////////////////////////////////////////////////////////////////// //

module.exports = {
    getToken,
    getInfo,
};
