function createBuildingsRepository() {
    let nextId = 1;
    const buildings = [
        { id: nextId++, name: 'Budynek A', address: 'ul. Warszawska 24, Kraków', createdAt: new Date().toISOString() },
        { id: nextId++, name: 'Budynek B', address: 'ul. Jana Pawła II 37, Kraków', createdAt: new Date().toISOString() },
    ];

    return {
        async findAll() {
            return buildings;
        },
        async findById(id) {
            return buildings.find(b => b.id === id) ?? null;
        },
        async create(data) {
            const building = { id: nextId++, ...data, createdAt: new Date().toISOString() };
            buildings.push(building);
            return building;
        },
        async update(id, data) {
            const building = buildings.find(b => b.id === id);
            if (!building) return null;
            Object.assign(building, data);
            return building;
        },
        async delete(id) {
            const index = buildings.findIndex(b => b.id === id);
            if (index === -1) return false;
            buildings.splice(index, 1);
            return true;
        },
    };
}

module.exports = { createBuildingsRepository };