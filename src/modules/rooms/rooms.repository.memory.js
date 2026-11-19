const DEFAULT_ROOMS = [
    { id: 1, buildingId: 1, name: 'A101', capacity: 30 },
    { id: 2, buildingId: 1, name: 'Computer Lab', capacity: 16 },
    { id: 3, buildingId: 2, name: 'Main Hall', capacity: 120 },
    { id: 4, buildingId: 2, name: 'Meeting Room', capacity: 8 },
];

function createRoomsRepository({ rooms: initial = DEFAULT_ROOMS } = {}) {
    const rooms = initial.map(r => ({ ...r }));
    let nextId = rooms.reduce((max, r) => Math.max(max, r.id), 0) + 1;

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