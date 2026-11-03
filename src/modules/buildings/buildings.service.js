const { NotFoundError } = require('../../errors');

function createBuildingsService({ buildingsRepository, roomsRepository }) {
    async function getAll() {
        return buildingsRepository.findAll();
    }

    async function getById(id) {
        const building = await buildingsRepository.findById(id);
        if (!building) {
            throw new NotFoundError(`Building ${id} not found`, 'BUILDING_NOT_FOUND');
        }
        return building;
    }

    async function getRooms(id) {
        await getById(id);
        return roomsRepository.findByBuildingId(id);
    }

    async function create(data) {
        return buildingsRepository.create(data);
    }

    return { getAll, getById, getRooms, create };
}

module.exports = { createBuildingsService };