function createAuditLogRepository() {
    const entries = [];
    let nextId = 1;

    return {
        async create({ eventType, payload }) {
            const entry = { id: nextId++, eventType, payload, createdAt: new Date().toISOString() };
            entries.push(entry);
            return entry;
        },

        async findPage({ eventType, page, limit }) {
            const matching = entries
                .filter(e => !eventType || e.eventType === eventType)
                .sort((a, b) => b.id - a.id);

            const start = (page - 1) * limit;
            return { items: matching.slice(start, start + limit), total: matching.length };
        },
    };
}

module.exports = { createAuditLogRepository };