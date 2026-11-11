const { Router } = require('express');
const { validate } = require('../../middleware/validate');
const { authorize } = require('../../middleware/authorize');
const { roomIdParamsSchema, createRoomSchema, updateRoomSchema } = require('./rooms.schemas');

function createRoomsRouter({ roomsController }) {
    const router = Router();

    router.get('/', roomsController.getAll);
    router.get('/:id', validate({ params: roomIdParamsSchema }), roomsController.getById);

    router.post(
        '/',
        authorize('ADMIN'),
        validate({ body: createRoomSchema }),
        roomsController.create,
    );
    router.patch(
        '/:id',
        authorize('ADMIN'),
        validate({ params: roomIdParamsSchema, body: updateRoomSchema }),
        roomsController.update,
    );
    router.delete(
        '/:id',
        authorize('ADMIN'),
        validate({ params: roomIdParamsSchema }),
        roomsController.remove,
    );

    return router;
}

module.exports = { createRoomsRouter };