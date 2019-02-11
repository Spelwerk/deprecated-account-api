const commonErrors = require('spelwerk-common-errors');
const { getQuery } = require('../../initializers/database');
const { getJWT } = require('../../initializers/jwt');
const { Expiry } = require('../../constants/index');
const roleSQL = require('../role/roleSQL');

const query = getQuery();
const jwt = getJWT();

const {
    AccountNotFoundError,
    AccountTokenError,
} = commonErrors;

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const createToken = async (uuid) => {
    const refreshRows = await query.SELECT('account_token', [ 'account_id' ], { uuid });

    if (!refreshRows || !refreshRows.length) {
        throw new AccountTokenError;
    }

    const id = parseInt(refreshRows[0].accountId);
    const accountRows = await query.SELECT('account', [ 'id' ], { id, deleted: false });

    if (!accountRows || !accountRows.length) {
        throw new AccountNotFoundError;
    }

    const roles = await roleSQL.selectRoles(id);
    const accountDetails = { id, roles };
    const { accessToken, expiry } = jwt.getAccessToken(accountDetails, Expiry.ACCESS_TOKEN.MINUTES);

    return { accessToken, session: { expiry, id, roles } };
};

// ////////////////////////////////////////////////////////////////////////////////// //
// EXPORTS
// ////////////////////////////////////////////////////////////////////////////////// //

module.exports = { createToken };
