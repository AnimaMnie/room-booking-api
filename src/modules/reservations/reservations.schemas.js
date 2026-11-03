const { z } = require('zod');

const dateTime = z.iso.datetime({ offset: true });
const positiveInt = z.coerce.number().int().positive();

const SORT_OPTIONS = [
    'startTime', '-startTime',
    'createdAt', '-createdAt',
    'participants', '-participants',
];

const createReservationSchema = z.strictObject({
    roomId: z.number().int().positive(),
    reservedBy: z.string().trim().min(3).max(100),
    participants: z.number().int().positive(),
    startTime: dateTime,
    endTime: dateTime,
});

const reservationIdParamsSchema = z.object({ id: positiveInt });

const listReservationsQuerySchema = z
    .object({
        roomId: positiveInt.optional(),
        buildingId: positiveInt.optional(),
        status: z.enum(['CONFIRMED', 'CANCELLED']).optional(),
        from: dateTime.optional(),
        to: dateTime.optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        sort: z.enum(SORT_OPTIONS).default('startTime'),
    })
    .refine(q => !q.from || !q.to || new Date(q.from) < new Date(q.to), {
        message: 'from must be earlier than to',
        path: ['from'],
    });

module.exports = {
    createReservationSchema,
    reservationIdParamsSchema,
    listReservationsQuerySchema,
};