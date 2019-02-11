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

const setEmailAndNotify = async (accountId, oldEmail, newEmail) => {
    await query.UPDATE('account', { email: newEmail }, { id: accountId });
    await query.DELETE('account_email', { accountId });

    const { subject, text, html } = emailTemplates.changeEmailConfirmation(newEmail);
    await mailer.sendMail(newEmail, subject, text, html);
    await mailer.sendMail(oldEmail, subject, text, html);
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

    const minutes = Expiry.EMAIL.MINUTES;
    const date = dateFns.format(new Date, DateFormat.DEFAULT);
    const timeout = dateFns.addMinutes(date, minutes);

    await query.INSERT('account_email', { accountId, secret, timeout }, { secret, timeout });

    const { subject, text, html } = emailTemplates.changeEmail(email, hash, timeout);
    await mailer.sendMail(email, subject, text, html);
    await testTools.saveHashToTestFile(hash);
};

const setNewEmail = async (oldEmail, secret, newEmail) => {
    const { accountId, isVerified } = await getAccountIdFromEmail(oldEmail);

    if (!isVerified) {
        throw new AccountNotVerifiedError;
    }

    await compareSecretFromTable('account_email', accountId, secret);

    newEmail = newEmail.toLowerCase();

    await setEmailAndNotify(accountId, oldEmail, newEmail);
};

const setNewEmailAsAdmin = async (accountId, editorId, newEmail) => {
    accountId = parseInt(accountId);
    editorId = parseInt(editorId);

    await verifyAdminRoles(editorId, [ Role.ADMIN, Role.MOD_USER ]);

    const rows = await query.SELECT('account', [ 'email' ], { id: accountId });
    const oldEmail = rows[0].email;

    await setEmailAndNotify(accountId, oldEmail, newEmail);
};

// ////////////////////////////////////////////////////////////////////////////////// //
// EXPORTS
// ////////////////////////////////////////////////////////////////////////////////// //

module.exports = {
    sendEmail,
    setNewEmail,
    setNewEmailAsAdmin,
};
