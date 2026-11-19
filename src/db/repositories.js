const { createUsersRepository } = require('../modules/users/users.repository.knex');
const { createBuildingsRepository } = require('../modules/buildings/buildings.repository.knex');
const { createRoomsRepository } = require('../modules/rooms/rooms.repository.knex');
const { createReservationsRepository } = require('../modules/reservations/reservations.repository.knex');

function buildRepositories(connection) {
    return {
        usersRepository: createUsersRepository(connection),
        buildingsRepository: createBuildingsRepository(connection),
        roomsRepository: createRoomsRepository(connection),
        reservationsRepository: createReservationsRepository(connection),
    };
}

function createKnexRepositories(db) {
    return {
        ...buildRepositories(db),
        runInTransaction: work => db.transaction(trx => work(buildRepositories(trx))),
    };
}

module.exports = { createKnexRepositories };