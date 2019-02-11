/* eslint-disable no-console */

require('dotenv').config();

const nconf = require('nconf');
const yamlFormat = require('nconf-yaml');
const { Connection, Query } = require('spelwerk-service-mysql');
const { Encryption } = require('spelwerk-service-utility');
const { Config, FieldTitle, RestrictedFields } = require('../src/constants');

const install = async () => {
    nconf.argv();
    nconf.env({ lowerCase: true, separator: '_' });
    nconf.file('config', { file: '../config/defaults.yml', format: yamlFormat });

    // connection
    const config = {
        host: nconf.get('database:host'),
        database: nconf.get('database:name'),
        user: nconf.get('database:user'),
        password: nconf.get('database:pass'),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        debug: false,
    };

    const connection = new Connection(config, FieldTitle, RestrictedFields);
    await connection.connect();
    const pool = connection.getPool();
    const schema = connection.getSchema();

    // query
    const query = new Query(pool, schema);

    // encryption
    const aesSecret = nconf.get('aes:secret');
    const shaSecret = nconf.get('sha:secret');
    const salt = Config.SALT;
    const encryption = new Encryption(aesSecret, shaSecret, salt);

    try {
        const id = 1;
        const email = nconf.get('admin:mail');
        const displayName = 'administrator';
        const unencryptedPassword = nconf.get('admin:pass');
        const password = await encryption.onionEncrypt(unencryptedPassword);

        const accountQuery = 'INSERT INTO account ' +
            '( id, email, password, display_name, is_verified, is_locked ) ' +
            'VALUES ' +
            '( ?,?,?,?,1,0 ) ' +
            'ON DUPLICATE KEY UPDATE ' +
            'email = ?,' +
            'password = ?,' +
            'display_name = ?,' +
            'is_verified = 1,' +
            'is_locked = 0';

        const accountParams = [
            id,
            email,
            password,
            displayName,
            // again for duplicate keys
            email,
            password,
            displayName,
        ];

        const insertId = await query.SQL(accountQuery, accountParams);

        if (insertId !== id) {
            return new Error(`accountResult is not 1. ${insertId}`);
        }

        console.log(`Administrator account created with \nemail: ${email} \npassword: ${unencryptedPassword}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

void install();
