const nconf = require('nconf');
const yamlFormat = require('nconf-yaml');

const init = (rootFolder) => {
    nconf.argv();
    nconf.env({ lowerCase: true, separator: '_' });
    nconf.file({ file: `${rootFolder}/config/defaults.yml`, format: yamlFormat });
    nconf.set('app:root', rootFolder);
};

module.exports = { init };
