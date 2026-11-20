const { createReservationsService } = require('../../src/modules/reservations/reservations.service');
const { createReservationsRepository } = require('../../src/modules/reservations/reservations.repository.memory');
const { createRoomsRepository } = require('../../src/modules/rooms/rooms.repository.memory');

const NOW = new Date('2027-01-10T08:00:00.000Z');

const USER = { id: 2, role: 'USER' };
const OTHER_USER = { id: 3, role: 'USER' };
const ADMIN = { id: 1, role: 'ADMIN' };

const ROOMS = [
    { id: 1, buildingId: 1, name: '101', capacity: 10 },
    { id: 2, buildingId: 1, name: '102', capacity: 20 },
];

function at(time) {
    return `2027-01-10T${time}:00.000Z`;
}

function reservation(overrides = {}) {
    return {
        id: 1,
        roomId: 1,
        userId: USER.id,
        participants: 5,
        startTime: at('10:00'),
        endTime: at('12:00'),
        status: 'CONFIRMED',
        createdAt: '2027-01-01T00:00:00.000Z',
        cancelledAt: null,
        ...overrides,
    };
}

function buildService({ reservations = [], rooms = ROOMS, now = NOW, eventBus = { publish() {} } } = {}) {
    const reservationsRepository = createReservationsRepository({ reservations });
    const roomsRepository = createRoomsRepository({ rooms });

    const service = createReservationsService({
        reservationsRepository,
        runInTransaction: work => work({ roomsRepository, reservationsRepository }),
        eventBus,
        now: () => now,
    });

    return { service, reservationsRepository, roomsRepository };
}

module.exports = { NOW, USER, OTHER_USER, ADMIN, at, reservation, buildService };