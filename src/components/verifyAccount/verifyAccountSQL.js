const dateFns = require('date-fns');
const { randomHash } = require('spelwerk-service-utility');
const commonErrors = require('spelwerk-common-errors');

const { getQuery } = require('../../initializers/database');
const { getEncryption } = require('../../initializers/encryption');
const { getMailer } = require('../../initializers/mailer');

const { getAccountIdFromEmail, compareSecretFromTable } = require('../account/accountSQL');
const { DateFormat, Expiry } = require('../../constants/index');
const refreshTokenSQL = require('../refreshToken/refreshTokenSQL');
const verifyExistsSQL = require('../verifyExists/verifyExistsSQL');
const emailTemplates = require('../../emailTemplates/index');
const testTools = require('../../utils/testTools');
const logger = require('../../utils/logger');

const query = getQuery();
const encryption = getEncryption();
const mailer = getMailer();

const { AccountDisplayNameAlreadyExistsError } = commonErrors;

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const sendEmail = async (email) => {
    logger.debug(`send email to: ${email}`);

    const { accountId } = await getAccountIdFromEmail(email);

    const hash = randomHash.uniqueHex();
    const secret = await encryption.strongEncrypt(hash);

    const days = Expiry.VERIFY.DAYS;
    const date = dateFns.format(new Date, DateFormat.DEFAULT);
    const timeout = dateFns.addDays(date, days);

    await query.INSERT('account_verify', { accountId, secret, timeout }, { secret, timeout });

    const { subject, text, html } = emailTemplates.verifyAccount(hash, timeout);
    await mailer.sendMail(email, subject, text, html);
    await testTools.saveHashToTestFile(hash);
};

const verifyAccount = async (email, secret, displayName, password, userAgent) => {
    logger.debug(`verify account with email: ${email}`);

    const { accountId } = await getAccountIdFromEmail(email);
    await compareSecretFromTable('account_verify', accountId, secret);

    displayName = displayName.toLowerCase();
    password = password || null;

    const exists = await verifyExistsSQL.displayNameExists(displayName);

    if (exists) {
        throw new AccountDisplayNameAlreadyExistsError;
    }

    if (password) {
        password = await encryption.onionEncrypt(password);
    }

    await query.UPDATE('account', { isVerified: 1, displayName, password }, { id: accountId });
    await query.DELETE('account_verify', { accountId });

    const { refreshToken, uuid } = await refreshTokenSQL.createToken(accountId, userAgent);

    return { refreshToken, uuid };
};

// ////////////////////////////////////////////////////////////////////////////////// //
// EXPORTS
// ////////////////////////////////////////////////////////////////////////////////// //

module.exports = {
    sendEmail,
    verifyAccount,
};
