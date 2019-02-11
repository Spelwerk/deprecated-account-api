const otpSQL = require('./otpSQL');

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const postOTP = async (req, res, next, accountId) => {
    try {
        const result = await otpSQL.insertOTP(accountId);
        res.status(200).send(result);
    } catch (err) {
        return next(err);
    }
};

const deleteOTP = async (req, res, next, accountId) => {
    try {
        await otpSQL.deleteOTP(accountId, req.account.id);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

const verifyOTP = async (req, res, next, accountId) => {
    try {
        await otpSQL.verifyOTP(accountId, req.body.otpToken);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    postOTP,
    deleteOTP,
    verifyOTP,
};
