const { EVENTS } = require('../../events/eventBus');

function registerAuditLogListener({ eventBus, auditLogRepository }) {
    for (const eventType of Object.values(EVENTS)) {
        eventBus.subscribe(eventType, 'audit-log', payload =>
            auditLogRepository.create({ eventType, payload }),
        );
    }
}

function registerNotificationListener({ eventBus, usersRepository, logger = console }) {
    eventBus.subscribe(EVENTS.RESERVATION_CANCELLED, 'notification', async payload => {
        if (payload.cancelledBy === payload.userId) return;

        const canceller = await usersRepository.findById(payload.cancelledBy);
        if (canceller?.role !== 'ADMIN') return;

        const owner = await usersRepository.findById(payload.userId);
        const email = owner?.email ?? `user #${payload.userId}`;

        logger.log(
            `[notification] to: ${email} - your reservation #${payload.reservationId} `
            + `(room ${payload.roomId}) was cancelled by administrator ${canceller.email}`,
        );
    });
}

module.exports = { registerAuditLogListener, registerNotificationListener };