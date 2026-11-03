exports.seed = async function (knex) {
    await knex.raw('TRUNCATE TABLE reservations, rooms, buildings RESTART IDENTITY CASCADE');

    await knex('buildings').insert([
        { name: 'Budynek A', address: 'ul. Warszawska 24, Kraków' },
        { name: 'Budynek B', address: 'ul. Jana Pawła II 37, Kraków' },
    ]);

    await knex('rooms').insert([
        { building_id: 1, name: '101', capacity: 30 },
        { building_id: 1, name: '102', capacity: 16 },
        { building_id: 1, name: 'Aula', capacity: 120 },
        { building_id: 2, name: '101', capacity: 20 },
        { building_id: 2, name: 'Sala konferencyjna', capacity: 8 },
    ]);

    await knex('reservations').insert([
        {
            room_id: 1,
            reserved_by: 'Jan Kowalski',
            participants: 20,
            start_time: '2026-12-01T10:00:00Z',
            end_time: '2026-12-01T12:00:00Z',
            status: 'CONFIRMED',
        },
        {
            room_id: 3,
            reserved_by: 'Anna Nowak',
            participants: 100,
            start_time: '2026-12-02T08:00:00Z',
            end_time: '2026-12-02T10:00:00Z',
            status: 'CONFIRMED',
        },
        {
            room_id: 4,
            reserved_by: 'Piotr Wiśniewski',
            participants: 15,
            start_time: '2026-12-03T12:00:00Z',
            end_time: '2026-12-03T14:00:00Z',
            status: 'CANCELLED',
            cancelled_at: '2026-11-01T09:00:00Z',
        },
        {
            room_id: 5,
            reserved_by: 'Katarzyna Zielińska',
            participants: 6,
            start_time: '2026-12-04T09:00:00Z',
            end_time: '2026-12-04T10:30:00Z',
            status: 'CONFIRMED',
        },
        {
            room_id: 2,
            reserved_by: 'Tomasz Lewandowski',
            participants: 10,
            start_time: '2026-10-27T08:00:00Z',
            end_time: '2026-10-27T10:00:00Z',
            status: 'CONFIRMED',
        },
    ]);
};