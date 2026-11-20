const express = require('express');
const swaggerUi = require('swagger-ui-express');

const { openApiSpec } = require('./docs/openapi');
const { createRequestLogger } = require('./middleware/requestLogger');
const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');
const { createAuthenticate } = require('./middleware/authenticate');

const { createTokenService } = require('./modules/auth/token.service');
const { createAuthService } = require('./modules/auth/auth.service');
const { createAuthController } = require('./modules/auth/auth.controller');
const { createAuthRouter } = require('./modules/auth/auth.routes');

const { createBuildingsService } = require('./modules/buildings/buildings.service');
const { createBuildingsController } = require('./modules/buildings/buildings.controller');
const { createBuildingsRouter } = require('./modules/buildings/buildings.routes');

const { createRoomsService } = require('./modules/rooms/rooms.service');
const { createRoomsController } = require('./modules/rooms/rooms.controller');
const { createRoomsRouter } = require('./modules/rooms/rooms.routes');

const { createReservationsService } = require('./modules/reservations/reservations.service');
const { createReservationsController } = require('./modules/reservations/reservations.controller');
const { createReservationsRouter } = require('./modules/reservations/reservations.routes');

const { createEventBus } = require('./events/eventBus');
const { registerAuditLogListener, registerNotificationListener } = require('./modules/audit/audit.listeners');
const { createAuditLogService } = require('./modules/audit/audit.service');
const { createAuditLogController } = require('./modules/audit/audit.controller');
const { createAuditLogRouter } = require('./modules/audit/audit.routes');

function createApp({
                       usersRepository,
                       buildingsRepository,
                       roomsRepository,
                       reservationsRepository,
                       auditLogRepository,
                       runInTransaction,
                       eventBus = createEventBus(),
                       jwt,
                       now = () => new Date(),
                       logRequests = true,
                   }) {
    const app = express();

    app.use(createRequestLogger({ log: logRequests }));
    app.use(express.json());

    registerAuditLogListener({ eventBus, auditLogRepository });
    registerNotificationListener({ eventBus, usersRepository });

    const tokenService = createTokenService(jwt);
    const authenticate = createAuthenticate({ tokenService });

    const authService = createAuthService({ usersRepository, tokenService });
    const buildingsService = createBuildingsService({ buildingsRepository, roomsRepository });
    const roomsService = createRoomsService({ roomsRepository, buildingsRepository });
    const reservationsService = createReservationsService({
        reservationsRepository,
        runInTransaction,
        eventBus,
        now,
    });
    const auditLogService = createAuditLogService({ auditLogRepository });

    const authController = createAuthController({ authService });
    const buildingsController = createBuildingsController({ buildingsService });
    const roomsController = createRoomsController({ roomsService });
    const reservationsController = createReservationsController({ reservationsService });
    const auditLogController = createAuditLogController({ auditLogService });

    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
    app.use('/api/auth', createAuthRouter({ authController, authenticate }));
    app.use('/api/buildings', authenticate, createBuildingsRouter({ buildingsController }));
    app.use('/api/rooms', authenticate, createRoomsRouter({ roomsController }));
    app.use('/api/reservations', authenticate, createReservationsRouter({ reservationsController }));
    app.use('/api/admin/audit-log', authenticate, createAuditLogRouter({ auditLogController }));

    app.use(notFound);
    app.use(errorHandler);

    return app;
}

module.exports = { createApp };