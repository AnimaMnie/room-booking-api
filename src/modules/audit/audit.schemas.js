const { z } = require('zod');
const { EVENTS } = require('../../events/eventBus');

const listAuditLogQuerySchema = z.object({
    eventType: z.enum(Object.values(EVENTS)).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = { listAuditLogQuerySchema };