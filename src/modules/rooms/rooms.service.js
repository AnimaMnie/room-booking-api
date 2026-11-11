const { NotFoundError } = require('../../errors');

function createRoomsService({ roomsRepository, buildingsRepository }) {
    async function getAll() {
        return roomsRepository.findAll();
    }

    async function getById(id) {
        const room = await roomsRepository.findById(id);
        if (!room) {
            throw new NotFoundError(`Room ${id} not found`, 'ROOM_NOT_FOUND');
        }
        return room;
    }

    async function create(data) {
        const building = await buildingsRepository.findById(data.buildingId);
        if (!building) {
            throw new NotFoundError(`Building ${data.buildingId} not found`, 'BUILDING_NOT_FOUND');
        }
        return roomsRepository.create(data);
    }

    async function update(id, data) {
        await getById(id);
        return roomsRepository.update(id, data);
    }

    async function remove(id) {
        await getById(id);
        await roomsRepository.delete(id);
    }

    return { getAll, getById, create, update, remove };
}

module.exports = { createRoomsService };