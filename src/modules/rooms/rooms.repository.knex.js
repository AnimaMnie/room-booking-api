function toRoom(row) {
    return {
        id: row.id,
        buildingId: row.building_id,
        building: {
            id: row.building_id,
            name: row.building_name,
        },
        name: row.name,
        capacity: row.capacity,
        createdAt: row.created_at,
    };
}

function createRoomsRepository(db) {
    function baseQuery() {
        return db('rooms')
            .join('buildings', 'buildings.id', 'rooms.building_id')
            .select('rooms.*', 'buildings.name as building_name');
    }

    async function findById(id) {
        const row = await baseQuery().where('rooms.id', id).first();
        return row ? toRoom(row) : null;
    }

    return {
        async findAll() {
            const rows = await baseQuery().orderBy('rooms.id');
            return rows.map(toRoom);
        },
        findById,
        async findByBuildingId(buildingId) {
            const rows = await baseQuery().where('rooms.building_id', buildingId).orderBy('rooms.id');
            return rows.map(toRoom);
        },
        async create(data) {
            const [{ id }] = await db('rooms')
                .insert({
                    building_id: data.buildingId,
                    name: data.name,
                    capacity: data.capacity,
                })
                .returning('id');
            return findById(id);
        },
    };
}

module.exports = { createRoomsRepository };