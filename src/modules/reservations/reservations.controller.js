const { toReservationResponse } = require('./reservations.mapper');

function createReservationsController({ reservationsService }) {
    async function getAll(req, res) {
        const { items, meta } = await reservationsService.list(req.validated.query);
        res.json({ data: items.map(toReservationResponse), meta });
    }

    async function getById(req, res) {
        const reservation = await reservationsService.getById(req.validated.params.id);
        res.json(toReservationResponse(reservation));
    }

    async function create(req, res) {
        const reservation = await reservationsService.create(req.validated.body);
        res
            .status(201)
            .location(`/api/reservations/${reservation.id}`)
            .json(toReservationResponse(reservation));
    }

    async function cancel(req, res) {
        const reservation = await reservationsService.cancel(req.validated.params.id);
        res.json(toReservationResponse(reservation));
    }

    return { getAll, getById, create, cancel };
}

module.exports = { createReservationsController };