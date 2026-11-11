const { config } = require('./config');
const { createApp } = require('./app');

function createRepositories() {
    if (config.STORAGE === 'memory') {
        const { createUsersRepository } = require('./modules/users/users.repository.memory');
        const { createBuildingsRepository } = require('./modules/buildings/buildings.repository.memory');
        const { createRoomsRepository } = require('./modules/rooms/rooms.repository.memory');
        const { createReservationsRepository } = require('./modules/reservations/reservations.repository.memory');

        const repositories = {
            usersRepository: createUsersRepository(),
            buildingsRepository: createBuildingsRepository(),
            roomsRepository: createRoomsRepository(),
            reservationsRepository: createReservationsRepository(),
        };

        return {
            ...repositories,
            runInTransaction: work => work(repositories),
        };
    }

    const { db } = require('./db/knex');
    const { createUsersRepository } = require('./modules/users/users.repository.knex');
    const { createBuildingsRepository } = require('./modules/buildings/buildings.repository.knex');
    const { createRoomsRepository } = require('./modules/rooms/rooms.repository.knex');
    const { createReservationsRepository } = require('./modules/reservations/reservations.repository.knex');

    const buildRepositories = connection => ({
        usersRepository: createUsersRepository(connection),
        buildingsRepository: createBuildingsRepository(connection),
        roomsRepository: createRoomsRepository(connection),
        reservationsRepository: createReservationsRepository(connection),
    });

    return {
        ...buildRepositories(db),
        runInTransaction: work => db.transaction(trx => work(buildRepositories(trx))),
    };
}

const app = createApp({
    ...createRepositories(),
    jwt: { secret: config.JWT_SECRET, expiresIn: config.JWT_EXPIRES_IN },
});

app.listen(config.PORT, () => {
    console.log(`Server running on http://localhost:${config.PORT} (storage: ${config.STORAGE})`);
});