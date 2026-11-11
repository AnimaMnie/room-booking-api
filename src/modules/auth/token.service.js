const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../../errors');

const ALGORITHM = 'HS256';

function createTokenService({ secret, expiresIn }) {
    function sign(user) {
        return jwt.sign({ role: user.role }, secret, {
            algorithm: ALGORITHM,
            subject: String(user.id),
            expiresIn,
        });
    }

    function verify(token) {
        try {
            const payload = jwt.verify(token, secret, { algorithms: [ALGORITHM] });
            return { id: Number(payload.sub), role: payload.role };
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                throw new UnauthorizedError('TOKEN_EXPIRED', 'Token expired');
            }
            throw new UnauthorizedError('INVALID_TOKEN', 'Invalid token');
        }
    }

    return { sign, verify, expiresIn };
}

module.exports = { createTokenService };