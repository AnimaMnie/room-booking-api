const request = require('supertest');
const {
    db,
    USERS,
    createTestApp,
    resetDatabase,
    insertReservations,
    loginAs,
} = require('../helpers/integration');

const app = createTestApp();

const futureReservation = {
    roomId: 1,
    participants: 5,
    startTime: '2030-05-10T10:00:00.000Z',
    endTime: '2030-05-10T12:00:00.000Z',
};

beforeAll(async () => {
    await db.migrate.latest();
});

beforeEach(async () => {
    await resetDatabase();
});

afterAll(async () => {
    await db.destroy();
});

describe('auth', () => {
    test('register, login and GET /api/auth/me', async () => {
        const registered = await request(app)
            .post('/api/auth/register')
            .send({ email: 'Nowy.User@Example.com', password: 'bardzo-dlugie-haslo' })
            .expect(201);

        expect(registered.body).toMatchObject({ email: 'nowy.user@example.com', role: 'USER' });
        expect(registered.body).not.toHaveProperty('passwordHash');

        const login = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nowy.user@example.com', password: 'bardzo-dlugie-haslo' })
            .expect(200);

        expect(login.body.tokenType).toBe('Bearer');

        const me = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${login.body.accessToken}`)
            .expect(200);

        expect(me.body).toMatchObject({ id: registered.body.id, email: 'nowy.user@example.com' });
    });

    test('401 without token', async () => {
        const response = await request(app).get('/api/reservations').expect(401);

        expect(response.body.error.code).toBe('UNAUTHORIZED');
        expect(response.body.error.requestId).toEqual(expect.any(String));
    });
});

describe('reservations', () => {
    test('POST /api/reservations returns 201, Location header and saves the record', async () => {
        const token = await loginAs(app, USERS.anna);

        const response = await request(app)
            .post('/api/reservations')
            .set('Authorization', `Bearer ${token}`)
            .send(futureReservation)
            .expect(201);

        expect(response.headers.location).toBe(`/api/reservations/${response.body.id}`);
        expect(response.body.user).toEqual({ id: USERS.anna.id, email: USERS.anna.email });

        const row = await db('reservations').where({ id: response.body.id }).first();
        expect(row).toMatchObject({
            room_id: 1,
            user_id: USERS.anna.id,
            participants: 5,
            status: 'CONFIRMED',
        });
        expect(row.start_time.toISOString()).toBe(futureReservation.startTime);
    });

    test('400 with details for invalid body', async () => {
        const token = await loginAs(app, USERS.anna);

        const response = await request(app)
            .post('/api/reservations')
            .set('Authorization', `Bearer ${token}`)
            .send({ roomId: 1, participants: -1, startTime: 'jutro', userId: 3 })
            .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
        expect(response.body.error.details).toEqual(expect.arrayContaining([
            expect.objectContaining({ location: 'body', field: 'participants' }),
            expect.objectContaining({ location: 'body', field: 'startTime' }),
            expect.objectContaining({ location: 'body', field: 'endTime' }),
            expect.objectContaining({ location: 'body', field: 'userId', message: 'Unknown field' }),
        ]));
    });

    test('409 ROOM_ALREADY_BOOKED for an overlapping reservation', async () => {
        await insertReservations([{
            room_id: 1,
            user_id: USERS.piotr.id,
            start_time: '2030-05-10T11:00:00Z',
            end_time: '2030-05-10T13:00:00Z',
        }]);
        const token = await loginAs(app, USERS.anna);

        const response = await request(app)
            .post('/api/reservations')
            .set('Authorization', `Bearer ${token}`)
            .send(futureReservation)
            .expect(409);

        expect(response.body.error.code).toBe('ROOM_ALREADY_BOOKED');
        expect(await db('reservations').count('* as count').first()).toEqual({ count: '1' });
    });

    test('404 when USER requests someone else\'s reservation', async () => {
        await insertReservations([{
            room_id: 1,
            user_id: USERS.piotr.id,
            start_time: '2030-05-10T10:00:00Z',
            end_time: '2030-05-10T12:00:00Z',
        }]);
        const token = await loginAs(app, USERS.anna);

        const response = await request(app)
            .get('/api/reservations/1')
            .set('Authorization', `Bearer ${token}`)
            .expect(404);

        expect(response.body.error.code).toBe('RESERVATION_NOT_FOUND');
    });

    test('pagination returns meta.total and limited data', async () => {
        await insertReservations(Array.from({ length: 5 }, (_, i) => ({
            room_id: 1,
            user_id: USERS.anna.id,
            start_time: `2030-06-0${i + 1}T10:00:00Z`,
            end_time: `2030-06-0${i + 1}T11:00:00Z`,
        })));
        const token = await loginAs(app, USERS.anna);

        const response = await request(app)
            .get('/api/reservations?limit=2&page=1')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(response.body.data).toHaveLength(2);
        expect(response.body.meta).toEqual({ page: 1, limit: 2, total: 5, totalPages: 3 });
    });
});

describe('rooms', () => {
    test('403 when USER tries to create a room', async () => {
        const token = await loginAs(app, USERS.anna);

        const response = await request(app)
            .post('/api/rooms')
            .set('Authorization', `Bearer ${token}`)
            .send({ buildingId: 1, name: '103', capacity: 15 })
            .expect(403);

        expect(response.body.error.code).toBe('FORBIDDEN');
        expect(await db('rooms').where({ name: '103' }).first()).toBeUndefined();
    });

    test('ADMIN can create a room', async () => {
        const token = await loginAs(app, USERS.admin);

        const response = await request(app)
            .post('/api/rooms')
            .set('Authorization', `Bearer ${token}`)
            .send({ buildingId: 1, name: '103', capacity: 15 })
            .expect(201);

        expect(response.body).toMatchObject({ name: '103', capacity: 15, building: { id: 1 } });
    });
});