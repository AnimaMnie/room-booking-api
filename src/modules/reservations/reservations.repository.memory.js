const HOUR = 60 * 60 * 1000;

function createReservationsRepository() {
    let nextId = 1;
    const reservations = [];

    const seedTime = Date.now();
    reservations.push({
        id: nextId++,
        roomId: 3,
        userId: 1,
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
        async findPage({ filters, sort, page, limit }) {
            const desc = sort.startsWith('-');
            const key = desc ? sort.slice(1) : sort;
            const time = value => new Date(value).getTime();

            const matching = reservations
                .filter(r => filters.roomId === undefined || r.roomId === filters.roomId)
                .filter(r => filters.userId === undefined || r.userId === filters.userId)
                .filter(r => filters.status === undefined || r.status === filters.status)
                .filter(r => filters.from === undefined || time(r.endTime) > time(filters.from))
                .filter(r => filters.to === undefined || time(r.startTime) < time(filters.to))
                .sort((a, b) => {
                    const diff = key === 'participants' ? a[key] - b[key] : time(a[key]) - time(b[key]);
                    return (desc ? -1 : 1) * (diff || a.id - b.id);
                });

            const start = (page - 1) * limit;
            return { items: matching.slice(start, start + limit), total: matching.length };
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