const { getQuery } = require('../../initializers/database');

const query = getQuery();

// ////////////////////////////////////////////////////////////////////////////////// //
// PUBLIC
// ////////////////////////////////////////////////////////////////////////////////// //

const emailExists = async (email) => {
    email = email.toLowerCase();

    const rows = await query.SELECT('account', [ 'id' ], { email });

    return rows && rows.length > 0;
};

const displayNameExists = async (displayName) => {
    displayName = displayName.toLowerCase();

    const rows = await query.SELECT('account', [ 'id' ], { display_name: displayName });

    return rows && rows.length > 0;
};

// ////////////////////////////////////////////////////////////////////////////////// //
// EXPORTS
// ////////////////////////////////////////////////////////////////////////////////// //

module.exports = {
    emailExists,
    displayNameExists,
};
