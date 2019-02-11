const nconf = require('nconf');
const { Association, Connection, Query, Relation } = require('spelwerk-service-mysql');
const { FieldTitle, RestrictedFields } = require('../constants/index');

let connection;
let query;
let association;
let relation;

const init = async () => {
    const conf = nconf.get();
    const config = {
        host: conf.database.host,
        database: conf.database.name,
        user: conf.database.user,
        password: conf.database.pass,
        waitForConnections: true,
        connectionLimit: 1000,
        queueLimit: 0,
        debug: false,
    };

    connection = new Connection(config, FieldTitle, RestrictedFields);
    await connection.connect();

    const pool = connection.getPool();
    const schema = connection.getSchema();

    query = new Query(pool, schema);
    association = new Association(pool, schema);
    relation = new Relation(pool, schema);
};

const getQuery = () => query;
const getAssociation = () => association;
const getRelation = () => relation;

module.exports = {
    init,
    getQuery,
    getAssociation,
    getRelation,
};
