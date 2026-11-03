const { toBuildingResponse } = require('./buildings.mapper');

function createBuildingsController({ buildingsService }) {
    async function getAll(req, res) {
        const buildings = await buildingsService.getAll();
        res.json(buildings.map(toBuildingResponse));
    }

    async function getById(req, res) {
        const building = await buildingsService.getById(req.validated.params.id);
        res.json(toBuildingResponse(building));
    }

    async function create(req, res) {
        const building = await buildingsService.create(req.validated.body);
        res
            .status(201)
            .location(`/api/buildings/${building.id}`)
            .json(toBuildingResponse(building));
    }

    return { getAll, getById, create };
}

module.exports = { createBuildingsController };