const json = schema => ({ 'application/json': { schema } });
const ref = name => ({ $ref: `#/components/schemas/${name}` });
const response = name => ({ $ref: `#/components/responses/${name}` });

const idParam = (description) => ({
    name: 'id',
    in: 'path',
    required: true,
    description,
    schema: { type: 'integer', minimum: 1 },
});

const ok = (description, schema) => ({ description, content: json(schema) });

const openApiSpec = {
    openapi: '3.0.3',
    info: {
        title: 'Room Booking API',
        version: '1.0.0',
        description: 'API do rezerwacji sal. Zaloguj się przez POST /api/auth/login, '
            + 'skopiuj accessToken i wklej go po kliknięciu przycisku Authorize.',
    },
    servers: [{ url: '/' }],
    tags: [
        { name: 'Auth' },
        { name: 'Buildings' },
        { name: 'Rooms' },
        { name: 'Reservations' },
    ],
    security: [{ bearerAuth: [] }],

    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
        schemas: {
            Error: {
                type: 'object',
                required: ['error'],
                properties: {
                    error: {
                        type: 'object',
                        required: ['code', 'message', 'requestId'],
                        properties: {
                            code: { type: 'string', example: 'VALIDATION_ERROR' },
                            message: { type: 'string', example: 'Validation failed' },
                            details: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        location: { type: 'string', enum: ['params', 'query', 'body'] },
                                        field: { type: 'string', example: 'participants' },
                                        message: { type: 'string', example: 'Too small: expected number to be >0' },
                                    },
                                },
                            },
                            requestId: { type: 'string', example: '6d36214c-d15b-40e6-8315-957fc46b92a9' },
                        },
                    },
                },
            },
            RegisterRequest: {
                type: 'object',
                required: ['email', 'password'],
                additionalProperties: false,
                properties: {
                    email: { type: 'string', format: 'email', example: 'jan.kowalski@example.com' },
                    password: { type: 'string', minLength: 10, maxLength: 72, example: 'bardzo-dlugie-haslo' },
                },
            },
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                additionalProperties: false,
                properties: {
                    email: { type: 'string', format: 'email', example: 'anna.nowak@example.com' },
                    password: { type: 'string', example: 'bardzo-dlugie-haslo' },
                },
            },
            TokenResponse: {
                type: 'object',
                properties: {
                    accessToken: { type: 'string' },
                    tokenType: { type: 'string', example: 'Bearer' },
                    expiresIn: { type: 'string', example: '15m' },
                },
            },
            User: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 2 },
                    email: { type: 'string', example: 'jan.kowalski@example.com' },
                    role: { type: 'string', enum: ['USER', 'ADMIN'] },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            Building: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    name: { type: 'string', example: 'Budynek A' },
                    address: { type: 'string', example: 'ul. Warszawska 24, Kraków' },
                    roomsCount: { type: 'integer', example: 3 },
                },
            },
            CreateBuildingRequest: {
                type: 'object',
                required: ['name', 'address'],
                additionalProperties: false,
                properties: {
                    name: { type: 'string', minLength: 1, maxLength: 100, example: 'Budynek C' },
                    address: { type: 'string', minLength: 3, maxLength: 200, example: 'ul. Kamienna 17, Kraków' },
                },
            },
            UpdateBuildingRequest: {
                type: 'object',
                minProperties: 1,
                additionalProperties: false,
                properties: {
                    name: { type: 'string', minLength: 1, maxLength: 100 },
                    address: { type: 'string', minLength: 3, maxLength: 200 },
                },
            },
            Room: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    name: { type: 'string', example: '101' },
                    capacity: { type: 'integer', example: 30 },
                    building: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer', example: 1 },
                            name: { type: 'string', example: 'Budynek A' },
                        },
                    },
                },
            },
            CreateRoomRequest: {
                type: 'object',
                required: ['buildingId', 'name', 'capacity'],
                additionalProperties: false,
                properties: {
                    buildingId: { type: 'integer', minimum: 1, example: 1 },
                    name: { type: 'string', minLength: 1, maxLength: 100, example: '103' },
                    capacity: { type: 'integer', minimum: 1, example: 25 },
                },
            },
            UpdateRoomRequest: {
                type: 'object',
                minProperties: 1,
                additionalProperties: false,
                properties: {
                    name: { type: 'string', minLength: 1, maxLength: 100 },
                    capacity: { type: 'integer', minimum: 1 },
                },
            },
            Reservation: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    room: ref('Room'),
                    user: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer', example: 2 },
                            email: { type: 'string', example: 'anna.nowak@example.com' },
                        },
                    },
                    participants: { type: 'integer', example: 20 },
                    startTime: { type: 'string', format: 'date-time' },
                    endTime: { type: 'string', format: 'date-time' },
                    status: { type: 'string', enum: ['CONFIRMED', 'CANCELLED'] },
                    createdAt: { type: 'string', format: 'date-time' },
                    cancelledAt: { type: 'string', format: 'date-time', nullable: true },
                },
            },
            CreateReservationRequest: {
                type: 'object',
                required: ['roomId', 'participants', 'startTime', 'endTime'],
                additionalProperties: false,
                properties: {
                    roomId: { type: 'integer', minimum: 1, example: 1 },
                    participants: { type: 'integer', minimum: 1, example: 5 },
                    startTime: { type: 'string', format: 'date-time', example: '2027-01-10T10:00:00Z' },
                    endTime: { type: 'string', format: 'date-time', example: '2027-01-10T11:00:00Z' },
                },
            },
            ReservationPage: {
                type: 'object',
                properties: {
                    data: { type: 'array', items: ref('Reservation') },
                    meta: {
                        type: 'object',
                        properties: {
                            page: { type: 'integer', example: 1 },
                            limit: { type: 'integer', example: 20 },
                            total: { type: 'integer', example: 3 },
                            totalPages: { type: 'integer', example: 1 },
                        },
                    },
                },
            },
        },
        responses: {
            BadRequest: { description: 'Validation error or invalid JSON', content: json(ref('Error')) },
            Unauthorized: { description: 'Missing, invalid or expired token', content: json(ref('Error')) },
            Forbidden: { description: 'Insufficient role', content: json(ref('Error')) },
            NotFound: { description: 'Resource not found', content: json(ref('Error')) },
            Conflict: { description: 'Conflict with current state of the resource', content: json(ref('Error')) },
        },
    },

    paths: {
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register a new user (role USER)',
                security: [],
                requestBody: { required: true, content: json(ref('RegisterRequest')) },
                responses: {
                    201: ok('User created', ref('User')),
                    400: response('BadRequest'),
                    409: { description: 'Email already taken (EMAIL_TAKEN)', content: json(ref('Error')) },
                },
            },
        },
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Log in and get an access token',
                security: [],
                requestBody: { required: true, content: json(ref('LoginRequest')) },
                responses: {
                    200: ok('Access token', ref('TokenResponse')),
                    400: response('BadRequest'),
                    401: { description: 'Invalid email or password', content: json(ref('Error')) },
                },
            },
        },
        '/api/auth/me': {
            get: {
                tags: ['Auth'],
                summary: 'Current user',
                responses: {
                    200: ok('Logged in user', ref('User')),
                    401: response('Unauthorized'),
                },
            },
        },

        '/api/buildings': {
            get: {
                tags: ['Buildings'],
                summary: 'List buildings with rooms count',
                responses: {
                    200: ok('Buildings', { type: 'array', items: ref('Building') }),
                    401: response('Unauthorized'),
                },
            },
            post: {
                tags: ['Buildings'],
                summary: 'Create building (ADMIN)',
                requestBody: { required: true, content: json(ref('CreateBuildingRequest')) },
                responses: {
                    201: ok('Building created', ref('Building')),
                    400: response('BadRequest'),
                    401: response('Unauthorized'),
                    403: response('Forbidden'),
                    409: response('Conflict'),
                },
            },
        },
        '/api/buildings/{id}': {
            parameters: [idParam('Building ID')],
            get: {
                tags: ['Buildings'],
                summary: 'Get building',
                responses: {
                    200: ok('Building', ref('Building')),
                    400: response('BadRequest'),
                    401: response('Unauthorized'),
                    404: response('NotFound'),
                },
            },
            patch: {
                tags: ['Buildings'],
                summary: 'Update building (ADMIN)',
                requestBody: { required: true, content: json(ref('UpdateBuildingRequest')) },
                responses: {
                    200: ok('Building updated', ref('Building')),
                    400: response('BadRequest'),
                    401: response('Unauthorized'),
                    403: response('Forbidden'),
                    404: response('NotFound'),
                    409: response('Conflict'),
                },
            },
            delete: {
                tags: ['Buildings'],
                summary: 'Delete building (ADMIN)',
                responses: {
                    204: { description: 'Building deleted' },
                    400: response('BadRequest'),
                    401: response('Unauthorized'),
                    403: response('Forbidden'),
                    404: response('NotFound'),
                    409: { description: 'Building still has rooms (RESOURCE_IN_USE)', content: json(ref('Error')) },
                },
            },
        },
        '/api/buildings/{id}/rooms': {
            parameters: [idParam('Building ID')],
            get: {
                tags: ['Buildings'],
                summary: 'Rooms in a building',
                responses: {
                    200: ok('Rooms', { type: 'array', items: ref('Room') }),
                    400: response('BadRequest'),
                    401: response('Unauthorized'),
                    404: response('NotFound'),
                },
            },
        },

        '/api/rooms': {
            get: {
                tags: ['Rooms'],
                summary: 'List rooms',
                responses: {
                    200: ok('Rooms', { type: 'array', items: ref('Room') }),
                    401: response('Unauthorized'),
                },
            },
            post: {
                tags: ['Rooms'],
                summary: 'Create room (ADMIN)',
                requestBody: { required: true, content: json(ref('CreateRoomRequest')) },
                responses: {
                    201: ok('Room created', ref('Room')),
                    400: response('BadRequest'),
                    401: response('Unauthorized'),
                    403: response('Forbidden'),
                    404: { description: 'Building not found', content: json(ref('Error')) },
                    409: response('Conflict'),
                },
            },
        },
        '/api/rooms/{id}': {
            parameters: [idParam('Room ID')],
            get: {
                tags: ['Rooms'],
                summary: 'Get room',
                responses: {
                    200: ok('Room', ref('Room')),
                    400: response('BadRequest'),
                    401: response('Unauthorized'),
                    404: response('NotFound'),
                },
            },
            patch: {
                tags: ['Rooms'],
                summary: 'Update room (ADMIN)',
                requestBody: { required: true, content: json(ref('UpdateRoomRequest')) },
                responses: {
                    200: ok('Room updated', ref('Room')),
                    400: response('BadRequest'),
                    401: response('Unauthorized'),
                    403: response('Forbidden'),
                    404: response('NotFound'),
                    409: response('Conflict'),
                },
            },
            delete: {
                tags: ['Rooms'],
                summary: 'Delete room (ADMIN)',
                responses: {
                    204: { description: 'Room deleted' },
                    400: response('BadRequest'),
                    401: response('Unauthorized'),
                    403: response('Forbidden'),
                    404: response('NotFound'),
                    409: { description: 'Room still has reservations (RESOURCE_IN_USE)', content: json(ref('Error')) },
                },
            },
        },

        '/api/reservations': {
            get: {
                tags: ['Reservations'],
                summary: 'List reservations (USER sees only own, ADMIN sees all)',
                parameters: [
                    { name: 'roomId', in: 'query', schema: { type: 'integer', minimum: 1 } },
                    { name: 'buildingId', in: 'query', schema: { type: 'integer', minimum: 1 } },
                    {
                        name: 'userId',
                        in: 'query',
                        description: 'ADMIN only - USER gets 403',
                        schema: { type: 'integer', minimum: 1 },
                    },
                    { name: 'status', in: 'query', schema: { type: 'string', enum: ['CONFIRMED', 'CANCELLED'] } },
                    { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
                    { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
                    { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
                    {
                        name: 'sort',
                        in: 'query',
                        schema: {
                            type: 'string',
                            enum: ['startTime', '-startTime', 'createdAt', '-createdAt', 'participants', '-participants'],
                            default: 'startTime',
                        },
                    },
                ],
                responses: {
                    200: ok('Page of reservations', ref('ReservationPage')),
                    400: response('BadRequest'),
                    401: response('Unauthorized'),
                    403: { description: 'USER tried to filter by userId', content: json(ref('Error')) },
                },
            },
            post: {
                tags: ['Reservations'],
                summary: 'Create reservation (owner taken from token)',
                requestBody: { required: true, content: json(ref('CreateReservationRequest')) },
                responses: {
                    201: ok('Reservation created', ref('Reservation')),
                    400: response('BadRequest'),
                    401: response('Unauthorized'),
                    404: { description: 'Room not found', content: json(ref('Error')) },
                    409: {
                        description: 'ROOM_ALREADY_BOOKED or ROOM_CAPACITY_EXCEEDED',
                        content: json(ref('Error')),
                    },
                },
            },
        },
        '/api/reservations/{id}': {
            parameters: [idParam('Reservation ID')],
            get: {
                tags: ['Reservations'],
                summary: 'Get reservation (owner or ADMIN)',
                responses: {
                    200: ok('Reservation', ref('Reservation')),
                    400: response('BadRequest'),
                    401: response('Unauthorized'),
                    404: { description: 'Not found or belongs to another user', content: json(ref('Error')) },
                },
            },
        },
        '/api/reservations/{id}/cancel': {
            parameters: [idParam('Reservation ID')],
            patch: {
                tags: ['Reservations'],
                summary: 'Cancel reservation (owner or ADMIN)',
                responses: {
                    200: ok('Reservation cancelled (idempotent)', ref('Reservation')),
                    400: response('BadRequest'),
                    401: response('Unauthorized'),
                    404: { description: 'Not found or belongs to another user', content: json(ref('Error')) },
                    409: { description: 'RESERVATION_ALREADY_STARTED', content: json(ref('Error')) },
                },
            },
        },
    },
};

module.exports = { openApiSpec };