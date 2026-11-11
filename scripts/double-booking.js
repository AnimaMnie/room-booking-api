require('dotenv').config({ quiet: true });
const knex = require('knex');
const config = require('../knexfile');

const API_URL = 'http://localhost:3000/api/reservations';
const REQUESTS = 10;

const reservation = {
    roomId: 2,
    reservedBy: 'Race Test',
    participants: 5,
    startTime: '2027-03-01T10:00:00.000Z',
    endTime: '2027-03-01T12:00:00.000Z',
};

async function main() {
    const db = knex(config);

    await db.raw(
        'DELETE FROM reservations WHERE room_id = ? AND start_time < ? AND end_time > ?',
        [reservation.roomId, reservation.endTime, reservation.startTime],
    );

    console.log(`Sending ${REQUESTS} parallel POST ${API_URL}`);
    console.log(`Room ${reservation.roomId}, ${reservation.startTime} - ${reservation.endTime}\n`);

    const responses = await Promise.all(
        Array.from({ length: REQUESTS }, () =>
            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservation),
            }),
        ),
    );

    const statuses = responses.map(r => r.status);
    statuses.forEach((status, i) => console.log(`Request ${String(i + 1).padStart(2)}: ${status}`));

    const summary = statuses.reduce((acc, s) => ({ ...acc, [s]: (acc[s] ?? 0) + 1 }), {});
    console.log('\nSummary:', summary);

    const { rows } = await db.raw(
        `SELECT COUNT(*)::int AS count
         FROM reservations
         WHERE room_id = ?
           AND status = 'CONFIRMED'
           AND start_time < ?
           AND end_time > ?`,
        [reservation.roomId, reservation.endTime, reservation.startTime],
    );
    console.log(`CONFIRMED reservations in DB for this room and time: ${rows[0].count}`);

    await db.destroy();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});