const COLUMNS = {
    roomId: 'room_id',
    reservedBy: 'reserved_by',
    participants: 'participants',
    startTime: 'start_time',
    endTime: 'end_time',
    status: 'status',
    cancelledAt: 'cancelled_at',
    createdAt: 'created_at',
};

function toRow(data) {
    const row = {};
    for (const [key, column] of Object.entries(COLUMNS)) {
        if (data[key] !== undefined) {
            row[column] = data[key];
        }
    }
    return row;
}

function toReservation(row) {
    return {
        id: row.id,
        roomId: row.room_id,
        room: {
            id: row.room_id,
            name: row.room_name,
            building: {
                id: row.building_id,
                name: row.building_name,
            },
        },
        reservedBy: row.reserved_by,
        participants: row.participants,
        startTime: row.start_time,
        endTime: row.end_time,
        status: row.status,
        cancelledAt: row.cancelled_at,
        createdAt: row.created_at,
    };
}

function createReservationsRepository(db) {
    function baseQuery() {
        return db('reservations')
            .join('rooms', 'rooms.id', 'reservations.room_id')
            .join('buildings', 'buildings.id', 'rooms.building_id')
            .select(
                'reservations.*',
                'rooms.name as room_name',
                'buildings.id as building_id',
                'buildings.name as building_name',
            );
    }

    async function findById(id) {
        const row = await baseQuery().where('reservations.id', id).first();
        return row ? toReservation(row) : null;
    }

    return {
        async findAll() {
            const rows = await baseQuery().orderBy('reservations.id');
            return rows.map(toReservation);
        },
        findById,
        async findByRoomId(roomId) {
            const rows = await baseQuery().where('reservations.room_id', roomId).orderBy('reservations.id');
            return rows.map(toReservation);
        },
        async create(data) {
            const [{ id }] = await db('reservations').insert(toRow(data)).returning('id');
            return findById(id);
        },
        async update(id, changes) {
            const updated = await db('reservations').where({ id }).update(toRow(changes));
            return updated ? findById(id) : null;
        },
    };
}

module.exports = { createReservationsRepository };