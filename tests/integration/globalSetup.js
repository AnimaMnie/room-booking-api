const { Client } = require('pg');
const { getTestDatabaseUrl } = require('./testDatabaseUrl');

module.exports = async function globalSetup() {
    const { url, databaseName } = getTestDatabaseUrl();

    const adminUrl = new URL(url);
    adminUrl.pathname = '/postgres';

    const client = new Client({ connectionString: adminUrl.toString() });
    await client.connect();

    try {
        const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
        if (rowCount === 0) {
            await client.query(`CREATE DATABASE "${databaseName}"`);
        }
    } finally {
        await client.end();
    }
};