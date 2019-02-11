const nconf = require('nconf');
const { JWT } = require('spelwerk-service-utility');
const { Config } = require('../constants');

let jwt;

const init = () => {
    const { secret } = nconf.get();
    jwt = new JWT(secret.jwt, Config.ISSUER);
};

const getJWT = () => jwt;

module.exports = {
    init,
    getJWT,
};
