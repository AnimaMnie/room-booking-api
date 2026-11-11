const { UnauthorizedError } = require('../errors');

function createAuthenticate({ tokenService }) {
    return function authenticate(req, res, next) {
        const header = req.get('Authorization');
        if (!header) {
            throw new UnauthorizedError('UNAUTHORIZED', 'Missing Authorization header');
        }

        const [scheme, token, ...rest] = header.split(' ');
        if (scheme !== 'Bearer' || !token || rest.length > 0) {
            throw new UnauthorizedError('UNAUTHORIZED', 'Authorization header must be: Bearer <token>');
        }

        req.user = tokenService.verify(token);
        next();
    };
}

module.exports = { createAuthenticate };