const otpLib = require('otplib');
const qrCode = require('qrcode');
const { randomHash } = require('spelwerk-service-utility');
const commonErrors = require('spelwerk-common-errors');

const { getQuery } = require('../../initializers/database');
const { getEncryption } = require('../../initializers/encryption');
const { Config, Role } = require('../../constants/index');
const { verifyAdminRoles } = require('../role/roleSQL');

const query = getQuery();
const encryption = getEncryption();

const {
    AccountNotLoggedInError,
    AccountOTPInvalidError,
    AccountOTPNotFoundError,
} = commonErrors;

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const insertOTP = async (accountId) => {
    accountId = parseInt(accountId);

    const uuid = randomHash.uuid();
    const otpSecret = otpLib.authenticator.generateSecret();
    const secret = encryption.simpleEncrypt(otpSecret);

    await query.INSERT('account_otp', { uuid, accountId, secret });
    await query.UPDATE('account', { isOtp: true }, { id: accountId });

    const url = otpLib.authenticator.keyuri(uuid, Config.ISSUER, otpSecret);
    const imageData = await qrCode.toDataURL(url);

    return { url, imageData };
};

const deleteOTP = async (accountId, editorId) => {
    accountId = parseInt(accountId);
    editorId = parseInt(editorId);

    if (!editorId) {
        throw new AccountNotLoggedInError;
    }

    if (editorId !== accountId) {
        await verifyAdminRoles(editorId, [ Role.ADMIN, Role.MOD_USER ]);
    }

    await query.DELETE('account_otp', { accountId });
    await query.UPDATE('account', { isOtp: false }, { id: accountId });
};

const verifyOTP = async (accountId, token) => {
    accountId = parseInt(accountId);

    const rows = await query.SELECT('account_otp', [ 'secret' ], { accountId });

    if (!rows && !rows.length) {
        throw new AccountOTPNotFoundError;
    }

    const secret = encryption.simpleDecrypt(rows[0].secret);
    const isValid = otpLib.authenticator.verify({ token, secret });

    if (!isValid) {
        throw new AccountOTPInvalidError;
    }
};

// ////////////////////////////////////////////////////////////////////////////////// //
// EXPORTS
// ////////////////////////////////////////////////////////////////////////////////// //

module.exports = {
    insertOTP,
    deleteOTP,
    verifyOTP,
};
