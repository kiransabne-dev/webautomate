const {Pool} = require('pg');

const pool = new Pool({
    host: "139.59.64.26",
    user: "postgres",
    database: "filesdb",
    password: "Diamond@1",
    max: 7,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
})

module.exports = {pgPool: pool}