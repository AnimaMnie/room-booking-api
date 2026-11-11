function toBuilding(row) {
    return {
        id: row.id,
        name: row.name,
        address: row.address,
        roomsCount: Number(row.rooms_count),
        createdAt: row.created_at,
    };
}

function createBuildingsRepository(db) {
    function baseQuery() {
        return db('buildings')
            .leftJoin('rooms', 'rooms.building_id', 'buildings.id')
            .select('buildings.*')
            .count('rooms.id as rooms_count')
            .groupBy('buildings.id');
    }

    async function findById(id) {
        const row = await baseQuery().where('buildings.id', id).first();
        return row ? toBuilding(row) : null;
    }

    return {
        async findAll() {
            const rows = await baseQuery().orderBy('buildings.id');
            return rows.map(toBuilding);
        },
        findById,
        async create(data) {
            const [{ id }] = await db('buildings')
                .insert({ name: data.name, address: data.address })
                .returning('id');
            return findById(id);
        },
        async update(id, data) {
            const updated = await db('buildings').where({ id }).update(data);
            return updated ? findById(id) : null;
        },
        async delete(id) {
            const deleted = await db('buildings').where({ id }).del();
            return deleted > 0;
        },
    };
}

module.exports = { createBuildingsRepository };