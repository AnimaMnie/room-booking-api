const { Router } = require('express');
const { validate } = require('../../middleware/validate');
const { buildingIdParamsSchema, createBuildingSchema } = require('./buildings.schemas');

function createBuildingsRouter({ buildingsController }) {
    const router = Router();

    router.get('/', buildingsController.getAll);
    router.get('/:id', validate({ params: buildingIdParamsSchema }), buildingsController.getById);
    router.get('/:id/rooms', validate({ params: buildingIdParamsSchema }), buildingsController.getRooms);
    router.post('/', validate({ body: createBuildingSchema }), buildingsController.create);

    return router;
}

module.exports = { createBuildingsRouter };