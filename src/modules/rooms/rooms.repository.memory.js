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
        async create(data) {
            const room = { id: nextId++, ...data };
            rooms.push(room);
            return room;
        },
    };
}

module.exports = { createRoomsRepository };