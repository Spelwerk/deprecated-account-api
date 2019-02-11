module.exports = (email) => {
    const subject = 'Your email has changed';

    const text = `Hello! Your email has been changed to: ${email}`;

    const html = `<b>Hello!</b>
        <br/>
        Your email has been changed to: ${email}
        `;

    return { subject, text, html };
};
