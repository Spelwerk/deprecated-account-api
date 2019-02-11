const { GUILink } = require('../constants');

module.exports = (email, secret, timeout) => {
    const href = `${GUILink.BASE + GUILink.VERIFY}/${email}/${secret}`;

    const subject = 'Verify your account';

    const text = `
        Hello! use the following link to verify your account creation and continue with the registration: ${href}.
        Your link will stop working on: ${timeout} or when it is used.
        `;

    const html = `
        <b>Hello!</b>
        <br/>
        Use the following verification code to verify your account creation and continue with the registration: 
        <a href="${href}">${secret}</a>
        <br/>
        This code will expire on ${timeout} or when it is used.
        `;

    return { subject, text, html };
};
