const { NotFoundError, ConflictError, ValidationError, ForbiddenError } = require('../../errors');
const { EVENTS } = require('../../events/eventBus');

const STATUS = {
    CONFIRMED: 'CONFIRMED',
    CANCELLED: 'CANCELLED',
};

const ALLOWED_TRANSITIONS = {
    [STATUS.CONFIRMED]: [STATUS.CANCELLED],
    [STATUS.CANCELLED]: [],
};

function canTransition(from, to) {
    return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

const MIN_DURATION = 15 * 60 * 1000;
const MAX_DURATION = 8 * 60 * 60 * 1000;

function timeError(field, message) {
    return new ValidationError([{ location: 'body', field, message }]);
}

function overlaps(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
}

function createReservationsService({ reservationsRepository, runInTransaction, eventBus, now }) {
    function isAdmin(currentUser) {
        return currentUser.role === 'ADMIN';
    }

    async function list({ page, limit, sort, ...filters }, currentUser) {
        if (!isAdmin(currentUser)) {
            if (filters.userId !== undefined) {
                throw new ForbiddenError('FORBIDDEN', 'Only ADMIN can filter reservations by userId');
            }
            filters.userId = currentUser.id;
        }

        const { items, total } = await reservationsRepository.findPage({ filters, sort, page, limit });
        return {
            items,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    async function getById(id, currentUser) {
        const reservation = await reservationsRepository.findById(id);

        if (!reservation || (!isAdmin(currentUser) && reservation.userId !== currentUser.id)) {
            throw new NotFoundError(`Reservation ${id} not found`, 'RESERVATION_NOT_FOUND');
        }
        return reservation;
    }

    function checkTimeRules(start, end) {
        if (end <= start) {
            throw timeError('endTime', 'endTime must be later than startTime');
        }

        const duration = end - start;
        if (duration < MIN_DURATION || duration > MAX_DURATION) {
            throw timeError('endTime', 'Reservation must last between 15 minutes and 8 hours');
        }

        if (start < now().getTime()) {
            throw timeError('startTime', 'startTime cannot be in the past');
        }
    }

    async function checkRoomIsFree(repository, roomId, start, end) {
        const roomReservations = await repository.findByRoomId(roomId);

        const conflict = roomReservations.find(r =>
            r.status === STATUS.CONFIRMED &&
            overlaps(start, end, new Date(r.startTime).getTime(), new Date(r.endTime).getTime()),
        );

        if (conflict) {
            throw new ConflictError(
                'ROOM_ALREADY_BOOKED',
                `Room ${roomId} is already booked in this time (reservation ${conflict.id})`,
            );
        }
    }

    async function create(data, currentUser) {
        const start = new Date(data.startTime).getTime();
        const end = new Date(data.endTime).getTime();

        checkTimeRules(start, end);

        const created = await runInTransaction(async ({ roomsRepository, reservationsRepository: txReservations }) => {
            const room = await roomsRepository.findByIdForUpdate(data.roomId);
            if (!room) {
                throw new NotFoundError(`Room ${data.roomId} not found`, 'ROOM_NOT_FOUND');
            }
            if (data.participants > room.capacity) {
                throw new ConflictError(
                    'ROOM_CAPACITY_EXCEEDED',
                    `Room capacity is ${room.capacity}, got ${data.participants} participants`,
                );
            }

            await checkRoomIsFree(txReservations, data.roomId, start, end);

            return txReservations.create({
                ...data,
                userId: currentUser.id,
                status: STATUS.CONFIRMED,
                createdAt: now().toISOString(),
                cancelledAt: null,
                internalNote: 'created via API v2',
            });
        });

        eventBus.publish(EVENTS.RESERVATION_CREATED, {
            reservationId: created.id,
            roomId: created.roomId,
            userId: created.userId,
            startTime: new Date(created.startTime).toISOString(),
            endTime: new Date(created.endTime).toISOString(),
        });

        return created;
    }

    async function cancel(id, currentUser) {
        const reservation = await getById(id, currentUser);

        if (reservation.status === STATUS.CANCELLED) {
            return reservation;
        }

        if (new Date(reservation.startTime).getTime() <= now().getTime()) {
            throw new ConflictError(
                'RESERVATION_ALREADY_STARTED',
                `Reservation ${id} has already started and cannot be cancelled`,
            );
        }

        if (!canTransition(reservation.status, STATUS.CANCELLED)) {
            throw new ConflictError(
                'INVALID_STATUS_TRANSITION',
                `Cannot change status from ${reservation.status} to ${STATUS.CANCELLED}`,
            );
        }

        const cancelled = await reservationsRepository.update(id, {
            status: STATUS.CANCELLED,
            cancelledAt: now().toISOString(),
        });

        eventBus.publish(EVENTS.RESERVATION_CANCELLED, {
            reservationId: cancelled.id,
            roomId: cancelled.roomId,
            userId: cancelled.userId,
            cancelledBy: currentUser.id,
        });

        return cancelled;
    }

    return { list, getById, create, cancel };
}

module.exports = { createReservationsService };