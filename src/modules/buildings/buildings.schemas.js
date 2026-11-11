const { z } = require('zod');

const buildingIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

const createBuildingSchema = z.strictObject({
    name: z.string().trim().min(1).max(100),
    address: z.string().trim().min(3).max(200),
});

const updateBuildingSchema = createBuildingSchema
    .partial()
    .refine(data => Object.keys(data).length > 0, { message: 'At least one field is required' });

module.exports = { buildingIdParamsSchema, createBuildingSchema, updateBuildingSchema };