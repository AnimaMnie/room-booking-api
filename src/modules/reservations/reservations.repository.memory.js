const HOUR = 60 * 60 * 1000;

function createReservationsRepository() {
    let nextId = 1;
    const reservations = [];

    const seedTime = Date.now();
    reservations.push({
        id: nextId++,
        roomId: 3,
        reservedBy: 'Anna Nowak',
        participants: 50,
        startTime: new Date(seedTime - HOUR).toISOString(),
        endTime: new Date(seedTime + HOUR).toISOString(),
        status: 'CONFIRMED',
        createdAt: new Date(seedTime - 24 * HOUR).toISOString(),
        cancelledAt: null,
        internalNote: 'seed: reservation already in progress',
    });

    return {
        async findAll() {
            return reservations;
        },
        async findById(id) {
            return reservations.find(r => r.id === id) ?? null;
        },
        async findByRoomId(roomId) {
            return reservations.filter(r => r.roomId === roomId);
        },
        async create(data) {
            const reservation = { id: nextId++, ...data };
            reservations.push(reservation);
            return reservation;
        },
        async update(id, changes) {
            const reservation = reservations.find(r => r.id === id);
            if (!reservation) return null;
            Object.assign(reservation, changes);
            return reservation;
        },
    };
}

module.exports = { createReservationsRepository };