const { Router } = require('express');
const { validate } = require('../../middleware/validate');
const { authorize } = require('../../middleware/authorize');
const {
    buildingIdParamsSchema,
    createBuildingSchema,
    updateBuildingSchema,
} = require('./buildings.schemas');

function createBuildingsRouter({ buildingsController }) {
    const router = Router();

    router.get('/', buildingsController.getAll);
    router.get('/:id', validate({ params: buildingIdParamsSchema }), buildingsController.getById);
    router.get('/:id/rooms', validate({ params: buildingIdParamsSchema }), buildingsController.getRooms);

    router.post(
        '/',
        authorize('ADMIN'),
        validate({ body: createBuildingSchema }),
        buildingsController.create,
    );
    router.patch(
        '/:id',
        authorize('ADMIN'),
        validate({ params: buildingIdParamsSchema, body: updateBuildingSchema }),
        buildingsController.update,
    );
    router.delete(
        '/:id',
        authorize('ADMIN'),
        validate({ params: buildingIdParamsSchema }),
        buildingsController.remove,
    );

    return router;
}

module.exports = { createBuildingsRouter };