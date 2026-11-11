function toIsoUtc(value) {
    return value ? new Date(value).toISOString() : null;
}

function toReservationResponse(r) {
    return {
        id: r.id,
        room: r.room ?? { id: r.roomId },
        user: r.user ?? { id: r.userId },
        participants: r.participants,
        startTime: toIsoUtc(r.startTime),
        endTime: toIsoUtc(r.endTime),
        status: r.status,
        createdAt: toIsoUtc(r.createdAt),
        cancelledAt: toIsoUtc(r.cancelledAt),
    };
}

module.exports = { toReservationResponse };