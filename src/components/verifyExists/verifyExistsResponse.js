const verifyExistsSQL = require('./verifyExistsSQL');

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const displayNameExists = async (req, res, next, displayName) => {
    try {
        const result = await verifyExistsSQL.displayNameExists(displayName);
        res.status(200).send({ exists: result });
    } catch (err) {
        return next(err);
    }
};

const emailExists = async (req, res, next, email) => {
    try {
        const result = await verifyExistsSQL.emailExists(email);
        res.status(200).send({ exists: result });
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    displayNameExists,
    emailExists,
};
