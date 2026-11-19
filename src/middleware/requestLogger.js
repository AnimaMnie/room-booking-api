const { randomUUID } = require('node:crypto');

function createRequestLogger({ log = true } = {}) {
    return function requestLogger(req, res, next) {
        const start = process.hrtime.bigint();

        req.requestId = req.get('X-Request-Id') || randomUUID();
        res.set('X-Request-Id', req.requestId);

        if (log) {
            res.on('finish', () => {
                const ms = Number(process.hrtime.bigint() - start) / 1e6;
                console.log(`[${req.requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`);
            });
        }

        next();
    };
}

module.exports = { createRequestLogger };