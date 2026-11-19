const { USER, OTHER_USER, ADMIN, at, reservation, buildService } = require('../helpers/reservations.fixture');

function newReservation(overrides = {}) {
    return {
        roomId: 1,
        participants: 5,
        startTime: at('10:00'),
        endTime: at('12:00'),
        ...overrides,
    };
}

describe('reservations service - overlapping', () => {
    const existing = reservation({ startTime: at('10:00'), endTime: at('12:00') });

    test.each([
        ['partial overlap at the start', '09:00', '11:00'],
        ['partial overlap at the end', '11:00', '13:00'],
        ['new contains existing', '09:00', '13:00'],
        ['new inside existing', '10:30', '11:30'],
        ['exactly the same interval', '10:00', '12:00'],
    ])('rejects %s (%s-%s)', async (_, start, end) => {
        const { service } = buildService({ reservations: [existing] });

        await expect(
            service.create(newReservation({ startTime: at(start), endTime: at(end) }), USER),
        ).rejects.toMatchObject({ code: 'ROOM_ALREADY_BOOKED' });
    });

    test.each([
        ['ending exactly when existing starts', '08:00', '10:00'],
        ['starting exactly when existing ends', '12:00', '13:00'],
    ])('allows touching interval %s (%s-%s)', async (_, start, end) => {
        const { service } = buildService({ reservations: [existing] });

        const created = await service.create(newReservation({ startTime: at(start), endTime: at(end) }), USER);

        expect(created.status).toBe('CONFIRMED');
    });

    test('allows the same time in another room', async () => {
        const { service } = buildService({ reservations: [existing] });

        const created = await service.create(newReservation({ roomId: 2 }), USER);

        expect(created.roomId).toBe(2);
    });

    test('CANCELLED reservation does not block the interval', async () => {
        const cancelled = reservation({ status: 'CANCELLED', cancelledAt: '2027-01-05T00:00:00.000Z' });
        const { service } = buildService({ reservations: [cancelled] });

        const created = await service.create(newReservation(), USER);

        expect(created.status).toBe('CONFIRMED');
    });
});

describe('reservations service - capacity', () => {
    test('allows participants equal to capacity', async () => {
        const { service } = buildService();

        const created = await service.create(newReservation({ participants: 10 }), USER);

        expect(created.participants).toBe(10);
    });

    test('rejects participants equal to capacity + 1', async () => {
        const { service } = buildService();

        await expect(service.create(newReservation({ participants: 11 }), USER))
            .rejects.toMatchObject({ code: 'ROOM_CAPACITY_EXCEEDED' });
    });
});

describe('reservations service - duration', () => {
    test.each([
        ['exactly 15 minutes', '10:00', '10:15'],
        ['exactly 8 hours', '10:00', '18:00'],
    ])('allows %s', async (_, start, end) => {
        const { service } = buildService();

        const created = await service.create(newReservation({ startTime: at(start), endTime: at(end) }), USER);

        expect(created.status).toBe('CONFIRMED');
    });

    test.each([
        ['14 minutes', '10:00', '10:14'],
        ['8 hours 1 minute', '10:00', '18:01'],
    ])('rejects %s', async (_, start, end) => {
        const { service } = buildService();

        await expect(
            service.create(newReservation({ startTime: at(start), endTime: at(end) }), USER),
        ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    });
});

describe('reservations service - cancelling', () => {
    test('rejects cancelling a reservation that has already started', async () => {
        const started = reservation({ startTime: at('07:00'), endTime: at('09:00') });
        const { service } = buildService({ reservations: [started] });

        await expect(service.cancel(1, USER))
            .rejects.toMatchObject({ code: 'RESERVATION_ALREADY_STARTED' });
    });

    test('double cancel is idempotent and keeps cancelledAt', async () => {
        const { service } = buildService({ reservations: [reservation()] });

        const first = await service.cancel(1, USER);
        const firstCancelledAt = first.cancelledAt;
        const second = await service.cancel(1, USER);

        expect(second.status).toBe('CANCELLED');
        expect(firstCancelledAt).not.toBeNull();
        expect(second.cancelledAt).toBe(firstCancelledAt);
    });
});

describe('reservations service - ownership', () => {
    test('another USER cannot cancel someone else\'s reservation', async () => {
        const { service } = buildService({ reservations: [reservation({ userId: USER.id })] });

        await expect(service.cancel(1, OTHER_USER))
            .rejects.toMatchObject({ code: 'RESERVATION_NOT_FOUND' });
    });

    test('ADMIN can cancel someone else\'s reservation', async () => {
        const { service } = buildService({ reservations: [reservation({ userId: USER.id })] });

        const cancelled = await service.cancel(1, ADMIN);

        expect(cancelled.status).toBe('CANCELLED');
    });
});