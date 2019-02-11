const commonErrors = require('spelwerk-common-errors');
const { getQuery } = require('../../initializers/database');
const { getEncryption } = require('../../initializers/encryption');

const query = getQuery();
const encryption = getEncryption();

const {
    AccountNotLoggedInError,
    AccountNotAllowedToEditError,
    AccountSecurityQuestionAnswerError,
    AccountSecurityQuestionNotFoundError,
} = commonErrors;

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const countQuestions = async (accountId) => {
    accountId = parseInt(accountId);

    return query.COUNT('account_security_question', { accountId });
};

const setSecure = async (accountId) => {
    accountId = parseInt(accountId);

    let isSecure = false;
    const amount = await countQuestions(accountId);

    if (amount > 2) {
        isSecure = true;
    }

    await query.UPDATE('account', { isSecure }, { id: accountId });
};

const getValidation = async (accountId) => {
    accountId = parseInt(accountId);

    const sql = 'SELECT ' +
        'security_question.id, ' +
        'security_question.text ' +
        'FROM ' +
        'account_security_question ' +
        'LEFT JOIN security_question ON security_question.id = account_security_question.security_question_id ' +
        'WHERE account_security_question.account_id = ? ' +
        'ORDER BY RAND() LIMIT 1';

    const rows = await query.SQL(sql, [ accountId ]);

    if (!rows && !rows.length) {
        throw new AccountSecurityQuestionNotFoundError;
    }

    return rows[0];
};

const tryValidation = async (accountId, securityQuestionId, answer) => {
    accountId = parseInt(accountId);
    securityQuestionId = parseInt(securityQuestionId);

    if (!accountId) {
        throw new AccountNotLoggedInError;
    }

    const rows = await query.SELECT('account_security_question', [ 'answer' ], { accountId, securityQuestionId });

    if (!rows && !rows.length) {
        throw new AccountSecurityQuestionNotFoundError;
    }

    const realAnswer = rows[0].answer;
    const result = encryption.strongCompare(answer, realAnswer);

    if (!result) {
        throw new AccountSecurityQuestionAnswerError;
    }
};

const selectQuestions = async (accountId) => {
    accountId = parseInt(accountId);

    const sql = 'SELECT ' +
        'security_question.id, ' +
        'security_question.text ' +
        'FROM ' +
        'account_security_question ' +
        'LEFT JOIN security_question ON security_question.id = account_security_question.security_question_id ' +
        'WHERE account_security_question.account_id = ?';

    return query.SQL(sql, [ accountId ]);
};

const insertQuestion = async (accountId, editorId, securityQuestionId, answer) => {
    accountId = parseInt(accountId);
    editorId = parseInt(editorId);
    securityQuestionId = parseInt(securityQuestionId);

    if (!editorId) {
        throw new AccountNotLoggedInError;
    }

    if (accountId !== editorId) {
        throw new AccountNotAllowedToEditError;
    }

    answer = encryption.strongEncrypt(answer);

    await query.INSERT('account_security_question', { accountId, securityQuestionId, answer });
    await setSecure(accountId);
};

const updateQuestion = async (accountId, editorId, securityQuestionId, answer) => {
    accountId = parseInt(accountId);
    editorId = parseInt(editorId);
    securityQuestionId = parseInt(securityQuestionId);

    if (!editorId) {
        throw new AccountNotLoggedInError;
    }

    if (accountId !== editorId) {
        throw new AccountNotAllowedToEditError;
    }

    answer = encryption.strongEncrypt(answer);

    await query.UPDATE('account_security_question', { answer }, { accountId, securityQuestionId });
};

const deleteQuestion = async (accountId, editorId, securityQuestionId) => {
    accountId = parseInt(accountId);
    editorId = parseInt(editorId);
    securityQuestionId = parseInt(securityQuestionId);

    if (!editorId) {
        throw new AccountNotLoggedInError;
    }

    const editorRoles = await selectQuestions(editorId);

    if (accountId !== editorId && (!editorRoles.ADMIN || !editorRoles.MOD_USER)) {
        throw new AccountNotAllowedToEditError;
    }

    await query.DELETE('account_security_question', { accountId, securityQuestionId });
    await setSecure(accountId);
};

module.exports = {
    selectQuestions,
    countQuestions,
    insertQuestion,
    updateQuestion,
    deleteQuestion,
    getValidation,
    tryValidation,
};
