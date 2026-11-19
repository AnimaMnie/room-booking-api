const bcrypt = require('bcryptjs');
const request = require('supertest');

const { config } = require('../../src/config');
const { db } = require('../../src/db/knex');
const { createKnexRepositories } = require('../../src/db/repositories');
const { createApp } = require('../../src/app');

const PASSWORD = 'test-password-123';
const PASSWORD_HASH = bcrypt.hashSync(PASSWORD, 4);

const USERS = {
    admin: { id: 1, email: 'admin@example.com', role: 'ADMIN' },
    anna: { id: 2, email: 'anna@example.com', role: 'USER' },
    piotr: { id: 3, email: 'piotr@example.com', role: 'USER' },
};

function createTestApp() {
    return createApp({
        ...createKnexRepositories(db),
        jwt: { secret: config.JWT_SECRET, expiresIn: config.JWT_EXPIRES_IN },
        logRequests: false,
    });
}

async function resetDatabase() {
    await db.raw('TRUNCATE TABLE reservations, rooms, buildings, users RESTART IDENTITY CASCADE');

    await db('users').insert(Object.values(USERS).map(user => ({
        email: user.email,
        password_hash: PASSWORD_HASH,
        role: user.role,
    })));

    await db('buildings').insert({ name: 'Budynek A', address: 'ul. Warszawska 24, Kraków' });

    await db('rooms').insert([
        { building_id: 1, name: '101', capacity: 10 },
        { building_id: 1, name: '102', capacity: 20 },
    ]);
}

async function insertReservations(rows) {
    await db('reservations').insert(rows.map(row => ({
        status: 'CONFIRMED',
        participants: 5,
        ...row,
    })));
}

async function loginAs(app, user) {
    const response = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: PASSWORD })
        .expect(200);

    return response.body.accessToken;
}

module.exports = {
    db,
    USERS,
    PASSWORD,
    createTestApp,
    resetDatabase,
    insertReservations,
    loginAs,
};