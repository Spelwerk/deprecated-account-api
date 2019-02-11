module.exports = () => {
    const subject = 'Your password has changed';

    const text = 'Hello! Your password has been changed.';

    const html = `<b>Hello!</b>
        <br/>
        Your password has been changed.
        `;

    return { subject, text, html };
};
