const DEFAULT_TEST_DATABASE_URL = 'postgres://booking:booking@localhost:5432/room_booking_test';

function getTestDatabaseUrl() {
    const url = process.env.TEST_DATABASE_URL || DEFAULT_TEST_DATABASE_URL;
    const databaseName = new URL(url).pathname.slice(1);

    if (!databaseName.endsWith('_test')) {
        throw new Error(
            `Refusing to run integration tests on "${databaseName}". `
            + 'Test database name must end with "_test".',
        );
    }

    return { url, databaseName };
}

module.exports = { getTestDatabaseUrl };