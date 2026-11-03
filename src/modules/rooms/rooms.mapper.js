function toRoomResponse(room) {
    return {
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        building: room.building ?? { id: room.buildingId },
    };
}

module.exports = { toRoomResponse };