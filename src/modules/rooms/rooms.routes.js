const { Router } = require('express');
const { validate } = require('../../middleware/validate');
const { roomIdParamsSchema, createRoomSchema } = require('./rooms.schemas');

function createRoomsRouter({ roomsController }) {
    const router = Router();

    router.get('/', roomsController.getAll);
    router.get('/:id', validate({ params: roomIdParamsSchema }), roomsController.getById);
    router.post('/', validate({ body: createRoomSchema }), roomsController.create);

    return router;
}

module.exports = { createRoomsRouter };