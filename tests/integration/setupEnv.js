const { getTestDatabaseUrl } = require('./testDatabaseUrl');

process.env.DATABASE_URL = getTestDatabaseUrl().url;
process.env.JWT_SECRET = 'integration-tests-secret-at-least-32-characters-long';
process.env.JWT_EXPIRES_IN = '15m';
process.env.STORAGE = 'knex';
process.env.ADMIN_EMAIL = 'admin@example.com';
process.env.ADMIN_PASSWORD = 'admin-test-password';
process.env.SEED_USER_PASSWORD = 'user-test-password';


