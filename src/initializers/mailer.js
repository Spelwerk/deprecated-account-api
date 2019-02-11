const nconf = require('nconf');
const { Mailer } = require('spelwerk-service-utility');
const { Config } = require('../constants');

let mailer;

const init = () => {
    const { key, dom } = nconf.get().mailgun;
    mailer = new Mailer(key, dom, Config.FROM);

    if (process.env.NODE_ENV === 'production') {
        mailer.setProduction(true);
    }
};

const getMailer = () => mailer;

module.exports = {
    init,
    getMailer,
};
