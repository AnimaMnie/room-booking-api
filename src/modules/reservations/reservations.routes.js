const { Router } = require('express');
const { validate } = require('../../middleware/validate');
const {
    createReservationSchema,
    reservationIdParamsSchema,
    listReservationsQuerySchema,
} = require('./reservations.schemas');

function createReservationsRouter({ reservationsController }) {
    const router = Router();

    router.get('/', validate({ query: listReservationsQuerySchema }), reservationsController.getAll);
    router.post('/', validate({ body: createReservationSchema }), reservationsController.create);
    router.patch('/:id/cancel', validate({ params: reservationIdParamsSchema }), reservationsController.cancel);

    return router;
}

module.exports = { createReservationsRouter };