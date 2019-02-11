const securityQuestionSQL = require('./securityQuestionSQL');

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const getQuestions = async (req, res, next, accountId) => {
    try {
        const result = await securityQuestionSQL.selectQuestions(accountId);
        res.status(200).send(result);
    } catch (err) {
        return next(err);
    }
};

const postQuestion = async (req, res, next, accountId) => {
    try {
        await securityQuestionSQL.insertQuestion(accountId, req.params.id, req.body.securityQuestionId, req.body.answer);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

const putQuestion = async (req, res, next, accountId, securityQuestionId) => {
    try {
        await securityQuestionSQL.updateQuestion(accountId, req.params.id, securityQuestionId, req.body.answer);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

const deleteQuestion = async (req, res, next, accountId, securityQuestionId) => {
    try {
        await securityQuestionSQL.deleteQuestion(accountId, req.account.id, securityQuestionId);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

const getValidation = async (req, res, next, accountId) => {
    try {
        const result = await securityQuestionSQL.getValidation(accountId);
        res.status(200).send(result);
    } catch (err) {
        return next(err);
    }
};

const tryValidation = async (req, res, next, accountId) => {
    try {
        await securityQuestionSQL.tryValidation(accountId, req.body.securityQuestionId, req.body.answer);
        res.status(204).send();
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    getQuestions,
    postQuestion,
    putQuestion,
    deleteQuestion,
    getValidation,
    tryValidation,
};
