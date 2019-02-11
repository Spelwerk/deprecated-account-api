const commonErrors = require('spelwerk-common-errors');
const { getQuery } = require('../../initializers/database');

const query = getQuery();

const {
    AccountNotLoggedInError,
    AccountNotAllowedToEditError,
} = commonErrors;

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const selectRoles = async (accountId) => {
    accountId = parseInt(accountId);

    const rows = await query.SQL('SELECT role.key FROM account_role LEFT JOIN role ON role.id = account_role.role_id WHERE account_id = ?', [ accountId ]);

    const roles = {};

    for (const i in rows) {
        if (!rows.hasOwnProperty(i)) continue;
        const { key } = rows[i];
        roles[key] = true;
    }

    return roles;
};

const insertRole = async (accountId, editorId, roleId) => {
    accountId = parseInt(accountId);
    editorId = parseInt(editorId);
    roleId = parseInt(roleId);

    if (!editorId) {
        throw new AccountNotLoggedInError;
    }

    const editorRoles = await selectRoles(editorId);

    if (!editorRoles.ADMIN) {
        throw new AccountNotAllowedToEditError;
    }

    await query.INSERT('account_role', { accountId, roleId });
};

const deleteRole = async (accountId, editorId, roleId) => {
    accountId = parseInt(accountId);
    editorId = parseInt(editorId);
    roleId = parseInt(roleId);

    if (!editorId) {
        throw new AccountNotLoggedInError;
    }

    const setterRoles = await selectRoles(editorId);

    if (!setterRoles.ADMIN) {
        throw new AccountNotAllowedToEditError;
    }

    await query.DELETE('account_role', { accountId, roleId });
};

const verifyAdminRoles = async (editorId, roleKeys) => {
    editorId = parseInt(editorId);

    if (!editorId) {
        throw new AccountNotLoggedInError;
    }

    const roles = await selectRoles(editorId);

    for (const i in roleKeys) {
        if (!roleKeys.hasOwnProperty(i)) continue;
        const { key } = roleKeys[i];
        if (roles[key]) return;
    }

    throw new AccountNotAllowedToEditError;
};

module.exports = {
    selectRoles,
    insertRole,
    deleteRole,
    verifyAdminRoles,
};
