const dateFns = require('date-fns');
const { randomHash } = require('spelwerk-service-utility');
const commonErrors = require('spelwerk-common-errors');

const { getQuery } = require('../../initializers/database');
const { getEncryption } = require('../../initializers/encryption');
const { getMailer } = require('../../initializers/mailer');

const { getAccountIdFromEmail, compareSecretFromTable } = require('../account/accountSQL');
const { verifyAdminRoles } = require('../role/roleSQL');
const { DateFormat, Expiry, Role } = require('../../constants/index');
const emailTemplates = require('../../emailTemplates/index');
const testTools = require('../../utils/testTools');

const query = getQuery();
const encryption = getEncryption();
const mailer = getMailer();

const { AccountNotVerifiedError } = commonErrors;

// ////////////////////////////////////////////////////////////////////////////////// //
// PRIVATE
// ////////////////////////////////////////////////////////////////////////////////// //

const setPassword = async (accountId, newPassword) => {
    const encryptedPassword = await encryption.onionEncrypt(newPassword);

    await query.UPDATE('account', { password: encryptedPassword }, { id: accountId });
    await query.DELETE('account_password', { accountId });
};

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const sendEmail = async (email) => {
    const { accountId, isVerified } = await getAccountIdFromEmail(email);

    if (!isVerified) {
        throw new AccountNotVerifiedError;
    }

    const hash = randomHash.uniqueHex();
    const secret = await encryption.strongEncrypt(hash);

    const minutes = Expiry.PASSWORD.MINUTES;
    const date = dateFns.format(new Date, DateFormat.DEFAULT);
    const timeout = dateFns.addMinutes(date, minutes);

    await query.INSERT('account_password', { accountId, secret, timeout }, { secret, timeout });

    const { subject, text, html } = emailTemplates.changePassword(hash, timeout);
    await mailer.sendMail(email, subject, text, html);
    await testTools.saveHashToTestFile(hash);
};

const setNewPassword = async (email, secret, newPassword) => {
    const { accountId, isVerified } = await getAccountIdFromEmail(email);

    if (!isVerified) {
        throw new AccountNotVerifiedError;
    }

    await compareSecretFromTable('account_password', accountId, secret);
    await setPassword(accountId, newPassword);

    const { subject, text, html } = emailTemplates.changePasswordConfirmation();
    await mailer.sendMail(email, subject, text, html);
};

const setNewPasswordAsAdmin = async (accountId, editorId, newPassword) => {
    accountId = parseInt(accountId);
    editorId = parseInt(editorId);

    await verifyAdminRoles(editorId, [ Role.ADMIN, Role.MOD_USER ]);
    await setPassword(accountId, newPassword);
};

// ////////////////////////////////////////////////////////////////////////////////// //
// EXPORTS
// ////////////////////////////////////////////////////////////////////////////////// //

module.exports = {
    sendEmail,
    setNewPassword,
    setNewPasswordAsAdmin,
};
