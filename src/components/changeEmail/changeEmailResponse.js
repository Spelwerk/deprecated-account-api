const changeEmailSQL = require('./changeEmailSQL');

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const sendEmail = async (req, res, next) => {
    try {
        await changeEmailSQL.sendEmail(req.body.email);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

const setNewEmail = async (req, res, next) => {
    try {
        await changeEmailSQL.setNewEmail(req.body.email, req.body.secret, req.body.newEmail);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

const setNewEmailAsAdmin = async (req, res, next, accountId) => {
    try {
        await changeEmailSQL.setNewEmailAsAdmin(accountId, req.account.id, req.body.newEmail);
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
    setNewEmail,
    setNewEmailAsAdmin,
};
