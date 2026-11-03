const { NotFoundError } = require('../../errors');

function createRoomsService({ roomsRepository }) {
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

    return { getAll, getById };
}

module.exports = { createRoomsService };