const dateFns = require('date-fns');
const { randomHash } = require('spelwerk-service-utility');
const commonErrors = require('spelwerk-common-errors');

const { getQuery } = require('../../initializers/database');
const { getEncryption } = require('../../initializers/encryption');
const { getMailer } = require('../../initializers/mailer');

const { displayNameExists, emailExists } = require('../verifyExists/verifyExistsSQL');
const { DateFormat, Expiry, Role } = require('../../constants/index');
const roleSQL = require('../role/roleSQL');
const emailTemplates = require('../../emailTemplates/index');
const testTools = require('../../utils/testTools');

const query = getQuery();
const encryption = getEncryption();
const mailer = getMailer();

const {
    AccountNotFoundError,
    AccountNotLoggedInError,
    AccountDisplayNameAlreadyExistsError,
    AccountEmailAlreadyExistsError,
    AccountEmailChangeNotRequestedError,
    AccountExpiredTimeoutError,
    AccountSecretInvalidError,
} = commonErrors;

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const selectAccount = async (what, where, expectingSingleObject) => {
    const options = { expectingResult: expectingSingleObject };
    const rows = await query.SELECT('account', what, where, options);

    return expectingSingleObject
        ? { result: rows[0] }
        : { results: rows };
};

const insertAccount = async (email) => {
    email = email.toLowerCase();

    const exists = await emailExists(email);

    if (exists) {
        throw new AccountEmailAlreadyExistsError;
    }

    const hash = randomHash.uniqueHex();
    const secret = await encryption.strongEncrypt(hash);

    const displayName = randomHash.uuid();
    const days = Expiry.VERIFY.DAYS;
    const date = dateFns.format(new Date, DateFormat.DEFAULT);
    const timeout = dateFns.addDays(date, days);
    const roleId = Role.USER.id;

    const accountId = await query.INSERT('account', { email, displayName });
    await query.INSERT('account_role', { accountId, roleId });
    await query.INSERT('account_verify', { accountId, secret, timeout });

    const { subject, text, html } = emailTemplates.verifyAccount(email, hash, timeout);
    await mailer.sendMail(email, subject, text, html);
    await testTools.saveHashToTestFile(hash);

    return { id: accountId };
};

const updateAccount = async (accountId, editorId, payload) => {
    accountId = parseInt(accountId);
    editorId = parseInt(editorId);

    if (!editorId) {
        throw new AccountNotLoggedInError;
    }

    if (editorId !== accountId) {
        await roleSQL.verifyAdminRoles(editorId, [ Role.ADMIN, Role.MOD_USER ]);
    }

    await query.UPDATE('account', payload, { id: accountId });
};

const deleteAccount = async (accountId, editorId) => {
    accountId = parseInt(accountId);
    editorId = parseInt(editorId);

    if (!editorId) {
        throw new AccountNotLoggedInError;
    }

    if (editorId !== accountId) {
        await roleSQL.verifyAdminRoles(editorId, [ Role.ADMIN, Role.MOD_USER ]);
    }

    const deletedText = `DELETED{{${accountId}}}`;
    const call = 'UPDATE account SET email = ?, is_verified = 0, password = NULL, display_name = ?, name_first = NULL, name_last = NULL, country = NULL, city = NULL, updated = CURRENT_TIMESTAMP, deleted = 1 WHERE id = ?';
    const array = [ deletedText, deletedText, accountId ];

    await query.SQL(call, array);
};

const setDisplayName = async (accountId, editorId, displayName) => {
    accountId = parseInt(accountId);
    editorId = parseInt(editorId);

    if (!editorId) {
        throw new AccountNotLoggedInError;
    }

    if (editorId !== accountId) {
        await roleSQL.verifyAdminRoles(editorId, [ Role.ADMIN, Role.MOD_USER ]);
    }

    displayName = displayName.toLowerCase();

    const exists = await displayNameExists(displayName);

    if (exists) {
        throw new AccountDisplayNameAlreadyExistsError;
    }

    await query.UPDATE('account', { display_name: displayName }, { id: accountId });
};

const getAccountIdFromEmail = async (email) => {
    email = email.toLowerCase();

    const rows = await query.SELECT('account', [ 'id', 'is_verified' ], { email });

    if (!rows || !rows.length) {
        throw new AccountNotFoundError;
    }

    const row = rows[0];
    const { id, isVerified } = row;

    return { accountId: id, isVerified };
};

const compareSecretFromTable = async (table, accountId, secret) => {
    accountId = parseInt(accountId);

    const rows = await query.SELECT(table, [ 'secret', 'timeout' ], { accountId });

    if (!rows || !rows.length) {
        throw new AccountEmailChangeNotRequestedError;
    }

    const comparison = rows[0];

    const isValidSecret = await encryption.strongCompare(secret, comparison.secret);

    if (!isValidSecret) {
        throw new AccountSecretInvalidError;
    }

    if (dateFns.isAfter(new Date(), new Date(comparison.timeout))) {
        throw new AccountExpiredTimeoutError;
    }
};

// ////////////////////////////////////////////////////////////////////////////////// //
// EXPORTS
// ////////////////////////////////////////////////////////////////////////////////// //

module.exports = {
    selectAccount,
    insertAccount,
    updateAccount,
    deleteAccount,
    setDisplayName,
    getAccountIdFromEmail,
    compareSecretFromTable,
};
