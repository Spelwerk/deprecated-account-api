const dateFns = require('date-fns');
const { randomHash } = require('spelwerk-service-utility');
const commonErrors = require('spelwerk-common-errors');

const { getQuery } = require('../../initializers/database');
const { getEncryption } = require('../../initializers/encryption');
const { getMailer } = require('../../initializers/mailer');

const { getAccountIdFromEmail, compareSecretFromTable } = require('../account/accountSQL');
const { DateFormat, Expiry } = require('../../constants/index');
const refreshTokenSQL = require('../refreshToken/refreshTokenSQL');
const otpSQL = require('../otp/otpSQL');
const emailTemplates = require('../../emailTemplates/index');
const testTools = require('../../utils/testTools');
const logger = require('../../utils/logger');

const query = getQuery();
const encryption = getEncryption();
const mailer = getMailer();

const {
    AccountNotFoundError,
    AccountNotVerifiedError,
    AccountLockedError,
    AccountPasswordInvalidError,
    AccountPasswordNotSetError,
} = commonErrors;

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const sendEmail = async (email) => {
    logger.debug(`requesting login for email ${email}`);

    const { accountId, isVerified } = await getAccountIdFromEmail(email);

    if (!isVerified) {
        throw new AccountNotVerifiedError;
    }

    const hash = randomHash.uniqueHex();
    const secret = await encryption.strongEncrypt(hash);

    const minutes = Expiry.LOGIN.MINUTES;
    const date = dateFns.format(new Date, DateFormat.DEFAULT);
    const timeout = dateFns.addMinutes(date, minutes);

    await query.INSERT('account_login', { accountId, secret, timeout }, { secret, timeout });

    const { subject, text, html } = emailTemplates.loginWithEmail(hash, timeout);
    await mailer.sendMail(email, subject, text, html);
    await testTools.saveHashToTestFile(hash);
};

const validateLoginSecret = async (email, secret, userAgent) => {
    const { accountId, isVerified } = await getAccountIdFromEmail(email);

    if (!isVerified) {
        throw new AccountNotVerifiedError;
    }

    await compareSecretFromTable('account_login', accountId, secret);

    const { refreshToken, uuid } = await refreshTokenSQL.createToken(accountId, userAgent);

    await query.DELETE('account_login', { accountId });

    return { refreshToken, uuid };
};

const withPassword = async (email, password, otpToken, userAgent) => {
    logger.debug(`login with password, using email ${email}`);

    email = email.toLowerCase();
    const rows = await query.SELECT('account', [ 'id', 'is_verified', 'is_locked', 'is_otp', 'password' ], { email });

    if (!rows || !rows.length) {
        throw new AccountNotFoundError;
    }

    const row = rows[0];

    if (!row.isVerified) {
        throw new AccountNotVerifiedError;
    }

    if (row.isLocked) {
        throw new AccountLockedError;
    }

    if (!row.password) {
        throw new AccountPasswordNotSetError;
    }

    const { id } = row;
    const comparison = row.password;

    const success = await encryption.onionCompare(password, comparison);

    if (!success) {
        throw new AccountPasswordInvalidError;
    }

    if (row.isOtp) {
        logger.debug(`login with otpToken ${otpToken}`);

        await otpSQL.verifyOTP(id, otpToken);
    }

    const { refreshToken, uuid } = await refreshTokenSQL.createToken(id, userAgent);

    return { refreshToken, uuid };
};

// ////////////////////////////////////////////////////////////////////////////////// //
// EXPORTS
// ////////////////////////////////////////////////////////////////////////////////// //

module.exports = {
    sendEmail,
    validateLoginSecret,
    withPassword,
};
