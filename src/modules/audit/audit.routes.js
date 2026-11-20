const { Router } = require('express');
const { validate } = require('../../middleware/validate');
const { authorize } = require('../../middleware/authorize');
const { listAuditLogQuerySchema } = require('./audit.schemas');

function createAuditLogRouter({ auditLogController }) {
    const router = Router();

    router.get(
        '/',
        authorize('ADMIN'),
        validate({ query: listAuditLogQuerySchema }),
        auditLogController.getAll,
    );

    return router;
}

module.exports = { createAuditLogRouter };