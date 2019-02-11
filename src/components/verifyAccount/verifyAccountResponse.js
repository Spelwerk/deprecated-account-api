const verifyAccountSQL = require('./verifyAccountSQL');
const accessTokenSQL = require('../accessToken/accessTokenSQL');

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const sendEmail = async (req, res, next) => {
    try {
        await verifyAccountSQL.sendEmail(req.body.email);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

const verifyAccount = async (req, res, next) => {
    const { email, secret, displayName, password } = req.body;

    try {
        const { refreshToken, uuid } = await verifyAccountSQL.verifyAccount(email, secret, displayName, password, req.useragent);
        const { accessToken, session } = await accessTokenSQL.createToken(uuid);

        res.status(200).send({ refreshToken, accessToken, session });
    } catch (err) {
        return next(err);
    }
};

// ////////////////////////////////////////////////////////////////////////////////// //
// EXPORTS
// ////////////////////////////////////////////////////////////////////////////////// //

module.exports = {
    sendEmail,
    verifyAccount,
};
