const commonErrors = require('spelwerk-common-errors');
const { getQuery } = require('../../initializers/database');
const { getJWT } = require('../../initializers/jwt');
const { Expiry } = require('../../constants/index');

const query = getQuery();
const jwt = getJWT();

const { AccountNotLoggedInError } = commonErrors;

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const getTokens = async (accountId) => {
    accountId = parseInt(accountId);

    if (!accountId) {
        throw new AccountNotLoggedInError;
    }

    return query.SELECT('account_token', [ 'uuid', 'name', 'browser', 'os' ], { accountId });
};

const setName = async (accountId, uuid, name) => {
    accountId = parseInt(accountId);

    if (!accountId) {
        throw new AccountNotLoggedInError;
    }

    await query.UPDATE('account_token', { name }, { accountId, uuid });
};

const revokeToken = async (accountId, uuid) => {
    await query.DELETE('account_token', { accountId, uuid });
};

const createToken = async (accountId, userAgent) => {
    accountId = parseInt(accountId);

    const { refreshToken, uuid } = jwt.getRefreshToken(Expiry.REFRESH_TOKEN.DAYS);

    await query.INSERT('account_token', {
        accountId,
        uuid,

        remote_address: userAgent.remoteAddress,

        is_mobile: userAgent.isMobile,
        is_tablet: userAgent.isTablet,
        is_desktop: userAgent.isDesktop,
        is_android: userAgent.isAndroid,
        is_iphone: userAgent.isiPhone,
        is_chrome: userAgent.isChrome,
        is_edge: userAgent.isEdge,
        is_firefox: userAgent.isFirefox,
        is_ie: userAgent.isIE,
        is_opera: userAgent.isOpera,
        is_safari: userAgent.isSafari,
        is_chrome_os: userAgent.isChromeOS,
        is_linux: userAgent.isLinux,
        is_mac: userAgent.isMac,
        is_windows: userAgent.isWindows,
    });

    return { refreshToken, uuid };
};

// ////////////////////////////////////////////////////////////////////////////////// //
// EXPORTS
// ////////////////////////////////////////////////////////////////////////////////// //

module.exports = {
    getTokens,
    setName,
    revokeToken,
    createToken,
};
