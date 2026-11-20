function createAuditLogService({ auditLogRepository }) {
    async function list({ eventType, page, limit }) {
        const { items, total } = await auditLogRepository.findPage({ eventType, page, limit });
        return {
            items,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    return { list };
}

module.exports = { createAuditLogService };
