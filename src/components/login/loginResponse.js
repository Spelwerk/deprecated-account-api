const loginSQL = require('./loginSQL');
const accessTokenSQL = require('../accessToken/accessTokenSQL');

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const sendEmail = async (req, res, next) => {
    try {
        await loginSQL.sendEmail(req.body.email);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

const validateLoginSecret = async (req, res, next) => {
    try {
        const { refreshToken, uuid } = await loginSQL.validateLoginSecret(req.body.email, req.body.secret, req.useragent);
        const { accessToken, session } = await accessTokenSQL.createToken(uuid);

        res.status(200).send({ refreshToken, accessToken, session });
    } catch (err) {
        return next(err);
    }
};

const withPassword = async (req, res, next) => {
    try {
        const { refreshToken, uuid } = await loginSQL.withPassword(req.body.email, req.body.password, req.body.otpToken, req.useragent);
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
    validateLoginSecret,
    withPassword,
};
