const { z } = require('zod');

const dateTime = z.iso.datetime({ offset: true });
const positiveInt = z.coerce.number().int().positive();

const createReservationSchema = z.strictObject({
    roomId: z.number().int().positive(),
    reservedBy: z.string().trim().min(3).max(100),
    participants: z.number().int().positive(),
    startTime: dateTime,
    endTime: dateTime,
});

const reservationIdParamsSchema = z.object({ id: positiveInt });

const listReservationsQuerySchema = z.object({ roomId: positiveInt.optional() });

module.exports = {
    createReservationSchema,
    reservationIdParamsSchema,
    listReservationsQuerySchema,
};