const { GUILink } = require('../constants');

module.exports = (email, secret, timeout) => {
    const href = `${GUILink.BASE + GUILink.LOGIN}/${email}/${secret}`;

    const subject = 'Change your email';

    const text = `
        Hello! use the following link to change your email: ${href}.
        Your link will stop working on: ${timeout} or when it is used.
        `;

    const html = `
        <b>Hello!</b>
        <br/>
        Use the following verification code to change your email: 
        <a href="${href}">${secret}</a>
        <br/>
        This code will expire on ${timeout} or when it is used.
        `;

    return { subject, text, html };
};
