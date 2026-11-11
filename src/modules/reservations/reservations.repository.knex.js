const COLUMNS = {
    roomId: 'room_id',
    userId: 'user_id',
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
        userId: row.user_id,
        user: {
            id: row.user_id,
            email: row.user_email,
        },
        participants: row.participants,
        startTime: row.start_time,
        endTime: row.end_time,
        status: row.status,
        cancelledAt: row.cancelled_at,
        createdAt: row.created_at,
    };
}

const SORT_COLUMNS = {
    startTime: 'reservations.start_time',
    createdAt: 'reservations.created_at',
    participants: 'reservations.participants',
};

function applyFilters(query, filters) {
    if (filters.roomId !== undefined) query.where('reservations.room_id', filters.roomId);
    if (filters.buildingId !== undefined) query.where('rooms.building_id', filters.buildingId);
    if (filters.userId !== undefined) query.where('reservations.user_id', filters.userId);
    if (filters.status !== undefined) query.where('reservations.status', filters.status);
    if (filters.from !== undefined) query.where('reservations.end_time', '>', filters.from);
    if (filters.to !== undefined) query.where('reservations.start_time', '<', filters.to);
}

function createReservationsRepository(db) {
    function baseQuery() {
        return db('reservations')
            .join('rooms', 'rooms.id', 'reservations.room_id')
            .join('buildings', 'buildings.id', 'rooms.building_id')
            .join('users', 'users.id', 'reservations.user_id')
            .select(
                'reservations.*',
                'rooms.name as room_name',
                'buildings.id as building_id',
                'buildings.name as building_name',
                'users.email as user_email',
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
        async findPage({ filters, sort, page, limit }) {
            const desc = sort.startsWith('-');
            const column = SORT_COLUMNS[desc ? sort.slice(1) : sort];
            const direction = desc ? 'desc' : 'asc';

            const [{ total }] = await db('reservations')
                .join('rooms', 'rooms.id', 'reservations.room_id')
                .modify(applyFilters, filters)
                .count('reservations.id as total');

            const rows = await baseQuery()
                .modify(applyFilters, filters)
                .orderBy(column, direction)
                .orderBy('reservations.id', direction)
                .limit(limit)
                .offset((page - 1) * limit);

            return { items: rows.map(toReservation), total: Number(total) };
        },
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