function toIsoUtc(value) {
    return value ? new Date(value).toISOString() : null;
}

function toReservationResponse(r) {
    return {
        id: r.id,
        roomId: r.roomId,
        reservedBy: r.reservedBy,
        participants: r.participants,
        startTime: toIsoUtc(r.startTime),
        endTime: toIsoUtc(r.endTime),
        status: r.status,
        createdAt: toIsoUtc(r.createdAt),
        cancelledAt: toIsoUtc(r.cancelledAt),
    };
}

module.exports = { toReservationResponse };