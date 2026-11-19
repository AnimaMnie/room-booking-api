const { config } = require('./config');
const { createApp } = require('./app');

function createStorage() {
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
            repositories: {
                ...repositories,
                runInTransaction: work => work(repositories),
            },
            close: async () => {},
        };
    }

    const { db } = require('./db/knex');
    const { createKnexRepositories } = require('./db/repositories');

    return {
        repositories: createKnexRepositories(db),
        close: () => db.destroy(),
    };
}

const storage = createStorage();

const app = createApp({
    ...storage.repositories,
    jwt: { secret: config.JWT_SECRET, expiresIn: config.JWT_EXPIRES_IN },
});

const server = app.listen(config.PORT, () => {
    console.log(`Server running on http://localhost:${config.PORT} (storage: ${config.STORAGE})`);
});

let shuttingDown = false;

function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`${signal} received - shutting down gracefully`);

    const forceExit = setTimeout(() => {
        console.error('Could not close connections in time - forcing shutdown');
        process.exit(1);
    }, 8000);
    forceExit.unref();

    server.close(async err => {
        if (err) {
            console.error('Error while closing HTTP server:', err);
        }
        console.log('HTTP server closed');

        await storage.close();
        console.log('Database connections closed');

        process.exit(err ? 1 : 0);
    });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));