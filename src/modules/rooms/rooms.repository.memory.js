function createRoomsRepository() {
    let nextId = 1;
    const rooms = [
        { id: nextId++, buildingId: 1, name: 'A101', capacity: 30 },
        { id: nextId++, buildingId: 1, name: 'Computer Lab', capacity: 16 },
        { id: nextId++, buildingId: 2, name: 'Main Hall', capacity: 120 },
        { id: nextId++, buildingId: 2, name: 'Meeting Room', capacity: 8 },
    ];

    return {
        async findAll() {
            return rooms;
        },
        async findById(id) {
            return rooms.find(r => r.id === id) ?? null;
        },
        async findByIdForUpdate(id) {
            return rooms.find(r => r.id === id) ?? null;
        },
        async findByBuildingId(buildingId) {
            return rooms.filter(r => r.buildingId === buildingId);
        },
        async create(data) {
            const room = { id: nextId++, ...data };
            rooms.push(room);
            return room;
        },
        async update(id, data) {
            const room = rooms.find(r => r.id === id);
            if (!room) return null;
            Object.assign(room, data);
            return room;
        },
        async delete(id) {
            const index = rooms.findIndex(r => r.id === id);
            if (index === -1) return false;
            rooms.splice(index, 1);
            return true;
        },
    };
}

module.exports = { createRoomsRepository };