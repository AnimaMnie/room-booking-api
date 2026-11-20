const { USER, at, reservation, buildService } = require('../helpers/reservations.fixture');

function newReservation(overrides = {}) {
    return { roomId: 1, participants: 5, startTime: at('14:00'), endTime: at('15:00'), ...overrides };
}

describe('reservations service - events', () => {
    test('publishes reservation.created after a successful create', async () => {
        const eventBus = { publish: jest.fn() };
        const { service } = buildService({ eventBus });

        const created = await service.create(newReservation(), USER);

        expect(eventBus.publish).toHaveBeenCalledTimes(1);
        expect(eventBus.publish).toHaveBeenCalledWith('reservation.created', {
            reservationId: created.id,
            roomId: 1,
            userId: USER.id,
            startTime: at('14:00'),
            endTime: at('15:00'),
        });
    });

    test('does not publish anything when create fails with 409', async () => {
        const eventBus = { publish: jest.fn() };
        const { service } = buildService({ reservations: [reservation()], eventBus });

        await expect(
            service.create(newReservation({ startTime: at('11:00'), endTime: at('13:00') }), USER),
        ).rejects.toMatchObject({ code: 'ROOM_ALREADY_BOOKED' });

        expect(eventBus.publish).not.toHaveBeenCalled();
    });
});