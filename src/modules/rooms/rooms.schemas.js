const { z } = require('zod');

const roomIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

const createRoomSchema = z.strictObject({
    buildingId: z.number().int().positive(),
    name: z.string().trim().min(1).max(100),
    capacity: z.number().int().positive(),
});

module.exports = { roomIdParamsSchema, createRoomSchema };