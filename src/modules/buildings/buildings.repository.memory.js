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
    };
}

module.exports = { createBuildingsRepository };