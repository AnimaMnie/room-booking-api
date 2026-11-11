const { z } = require('zod');

const roomIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

const createRoomSchema = z.strictObject({
    buildingId: z.number().int().positive(),
    name: z.string().trim().min(1).max(100),
    capacity: z.number().int().positive(),
});

const updateRoomSchema = createRoomSchema
    .omit({ buildingId: true })
    .partial()
    .refine(data => Object.keys(data).length > 0, { message: 'At least one field is required' });

module.exports = { roomIdParamsSchema, createRoomSchema, updateRoomSchema };