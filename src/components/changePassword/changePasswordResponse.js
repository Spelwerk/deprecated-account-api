const changePasswordSQL = require('./changePasswordSQL');

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const sendEmail = async (req, res, next) => {
    try {
        await changePasswordSQL.sendEmail(req.body.email);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

const setNewPassword = async (req, res, next) => {
    try {
        await changePasswordSQL.setNewPassword(req.body.email, req.body.secret, req.body.newPassword);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

const setNewPasswordAsAdmin = async (req, res, next, accountId) => {
    try {
        await changePasswordSQL.setNewPasswordAsAdmin(accountId, req.account.id, req.body.newPassword);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

// ////////////////////////////////////////////////////////////////////////////////// //
// EXPORTS
// ////////////////////////////////////////////////////////////////////////////////// //

module.exports = {
    sendEmail,
    setNewPassword,
    setNewPasswordAsAdmin,
};
