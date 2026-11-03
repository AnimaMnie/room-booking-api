const { AppError } = require('../errors');

const UNIQUE_VIOLATIONS = {
    buildings_name_unique: 'BUILDING_ALREADY_EXISTS',
    rooms_building_id_name_unique: 'ROOM_ALREADY_EXISTS',
};

function errorHandler(err, req, res, next) {
    let status = 500;
    let body = { code: 'INTERNAL_ERROR', message: 'Internal server error' };

    if (err instanceof AppError) {
        status = err.status;
        body = { code: err.code, message: err.message };
        if (err.details) body.details = err.details;
    } else if (err.type === 'entity.parse.failed') {
        status = 400;
        body = { code: 'INVALID_JSON', message: 'Request body contains invalid JSON' };
    } else if (err.code === '23505') {
        status = 409;
        body = {
            code: UNIQUE_VIOLATIONS[err.constraint] ?? 'DUPLICATE_VALUE',
            message: 'Resource with these values already exists',
        };
    } else {
        console.error(`[${req.requestId}] Unhandled error:`, err.stack);
    }

    res.status(status).json({ error: { ...body, requestId: req.requestId } });
}

module.exports = { errorHandler };