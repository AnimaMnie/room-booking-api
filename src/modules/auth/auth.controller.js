const { toUserResponse } = require('../users/users.mapper');

function createAuthController({ authService }) {
    async function register(req, res) {
        const user = await authService.register(req.validated.body);
        res.status(201).json(toUserResponse(user));
    }

    async function login(req, res) {
        const token = await authService.login(req.validated.body);
        res.json(token);
    }

    async function me(req, res) {
        const user = await authService.getCurrentUser(req.user);
        res.json(toUserResponse(user));
    }

    return { register, login, me };
}

module.exports = { createAuthController };