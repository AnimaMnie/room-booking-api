require('dotenv').config({ quiet: true });

const { createApp } = require('./app');

function createRepositories() {
    if (process.env.STORAGE === 'memory') {
        const { createBuildingsRepository } = require('./modules/buildings/buildings.repository.memory');
        const { createRoomsRepository } = require('./modules/rooms/rooms.repository.memory');
        const { createReservationsRepository } = require('./modules/reservations/reservations.repository.memory');

        return {
            buildingsRepository: createBuildingsRepository(),
            roomsRepository: createRoomsRepository(),
            reservationsRepository: createReservationsRepository(),
        };
    }

    const { db } = require('./db/knex');
    const { createBuildingsRepository } = require('./modules/buildings/buildings.repository.knex');
    const { createRoomsRepository } = require('./modules/rooms/rooms.repository.knex');
    const { createReservationsRepository } = require('./modules/reservations/reservations.repository.knex');

    return {
        buildingsRepository: createBuildingsRepository(db),
        roomsRepository: createRoomsRepository(db),
        reservationsRepository: createReservationsRepository(db),
    };
}

const app = createApp(createRepositories());

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} (storage: ${process.env.STORAGE ?? 'knex'})`);
});