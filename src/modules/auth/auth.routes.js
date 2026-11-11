const { Router } = require('express');
const { validate } = require('../../middleware/validate');
const { registerSchema, loginSchema } = require('./auth.schemas');

function createAuthRouter({ authController, authenticate }) {
    const router = Router();

    router.post('/register', validate({ body: registerSchema }), authController.register);
    router.post('/login', validate({ body: loginSchema }), authController.login);
    router.get('/me', authenticate, authController.me);

    return router;
}

module.exports = { createAuthRouter };