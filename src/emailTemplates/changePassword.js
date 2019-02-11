const { GUILink } = require('../constants');

module.exports = (email, secret, timeout) => {
    const href = `${GUILink.BASE + GUILink.PASSWORD}/${email}/${secret}`;

    const subject = 'Change your password';

    const text = `Hello! Use the following link to reset your password: ${href}.
        Your link will stop working on: ${timeout} or when it is used.
        `;

    const html = `
        <b>Hello!</b>
        <br/>
        Use the following verification code to change your password:
        <a href="${href}">${secret}</a>
        <br/>
        This code will expire on ${timeout} or when it is used.
        `;

    return { subject, text, html };
};
