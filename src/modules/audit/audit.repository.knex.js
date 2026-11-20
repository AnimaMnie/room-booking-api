function toEntry(row) {
    return {
        id: row.id,
        eventType: row.event_type,
        payload: row.payload,
        createdAt: row.created_at,
    };
}

function createAuditLogRepository(db) {
    return {
        async create({ eventType, payload }) {
            const [row] = await db('audit_log')
                .insert({ event_type: eventType, payload })
                .returning('*');
            return toEntry(row);
        },

        async findPage({ eventType, page, limit }) {
            const base = db('audit_log').modify(query => {
                if (eventType) query.where('event_type', eventType);
            });

            const [{ count }] = await base.clone().count({ count: '*' });
            const rows = await base
                .clone()
                .select('*')
                .orderBy([
                    { column: 'created_at', order: 'desc' },
                    { column: 'id', order: 'desc' },
                ])
                .limit(limit)
                .offset((page - 1) * limit);

            return { items: rows.map(toEntry), total: Number(count) };
        },
    };
}

module.exports = { createAuditLogRepository };