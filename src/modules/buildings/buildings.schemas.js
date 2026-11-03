const { z } = require('zod');

const buildingIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

const createBuildingSchema = z.strictObject({
    name: z.string().trim().min(1).max(100),
    address: z.string().trim().min(3).max(200),
});

module.exports = { buildingIdParamsSchema, createBuildingSchema };