const { toBuildingResponse } = require('./buildings.mapper');
const { toRoomResponse } = require('../rooms/rooms.mapper');

function createBuildingsController({ buildingsService }) {
    async function getAll(req, res) {
        const buildings = await buildingsService.getAll();
        res.json(buildings.map(toBuildingResponse));
    }

    async function getById(req, res) {
        const building = await buildingsService.getById(req.validated.params.id);
        res.json(toBuildingResponse(building));
    }

    async function getRooms(req, res) {
        const rooms = await buildingsService.getRooms(req.validated.params.id);
        res.json(rooms.map(toRoomResponse));
    }

    async function create(req, res) {
        const building = await buildingsService.create(req.validated.body);
        res
            .status(201)
            .location(`/api/buildings/${building.id}`)
            .json(toBuildingResponse(building));
    }

    async function update(req, res) {
        const building = await buildingsService.update(req.validated.params.id, req.validated.body);
        res.json(toBuildingResponse(building));
    }

    async function remove(req, res) {
        await buildingsService.remove(req.validated.params.id);
        res.status(204).end();
    }

    return { getAll, getById, getRooms, create, update, remove };
}

module.exports = { createBuildingsController };