const { toReservationResponse } = require('./reservations.mapper');

function createReservationsController({ reservationsService }) {
    async function getAll(req, res) {
        const list = await reservationsService.getAll(req.validated.query.roomId);
        res.json(list.map(toReservationResponse));
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

    return { getAll, create, cancel };
}

module.exports = { createReservationsController };