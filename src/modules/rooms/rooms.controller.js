const { toRoomResponse } = require('./rooms.mapper');

function createRoomsController({ roomsService }) {
    async function getAll(req, res) {
        const rooms = await roomsService.getAll();
        res.json(rooms.map(toRoomResponse));
    }

    async function getById(req, res) {
        const room = await roomsService.getById(req.validated.params.id);
        res.json(toRoomResponse(room));
    }

    async function create(req, res) {
        const room = await roomsService.create(req.validated.body);
        res
            .status(201)
            .location(`/api/rooms/${room.id}`)
            .json(toRoomResponse(room));
    }

    async function update(req, res) {
        const room = await roomsService.update(req.validated.params.id, req.validated.body);
        res.json(toRoomResponse(room));
    }

    async function remove(req, res) {
        await roomsService.remove(req.validated.params.id);
        res.status(204).end();
    }

    return { getAll, getById, create, update, remove };
}

module.exports = { createRoomsController };