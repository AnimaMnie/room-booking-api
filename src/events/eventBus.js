const { EventEmitter } = require('node:events');

const EVENTS = {
    RESERVATION_CREATED: 'reservation.created',
    RESERVATION_CANCELLED: 'reservation.cancelled',
};

function createEventBus({ logger = console } = {}) {
    const emitter = new EventEmitter();

    function subscribe(eventType, name, handler) {
        emitter.on(eventType, payload => {
            Promise.resolve()
                .then(() => handler(payload))
                .catch(err => {
                    logger.error(`[event-bus] listener "${name}" failed for ${eventType}:`, err);
                });
        });
    }

    function publish(eventType, payload) {
        emitter.emit(eventType, payload);
    }

    return { subscribe, publish };
}

module.exports = { createEventBus, EVENTS };