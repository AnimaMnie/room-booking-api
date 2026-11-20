function createAuditLogController({ auditLogService }) {
    async function getAll(req, res) {
        const { items, meta } = await auditLogService.list(req.validated.query);
        res.json({ data: items, meta });
    }

    return { getAll };
}

module.exports = { createAuditLogController };