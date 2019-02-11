const nconf = require('nconf');
const { Encryption } = require('spelwerk-service-utility');
const { Config } = require('../constants');

let encryption;

const init = () => {
    const { aes, sha } = nconf.get().secret;
    encryption = new Encryption(aes, sha, Config.SALT);
};

const getEncryption = () => encryption;

module.exports = {
    init,
    getEncryption,
};
