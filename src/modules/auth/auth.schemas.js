const { z } = require('zod');

const email = z.string().trim().toLowerCase().pipe(z.email().max(254));

const registerSchema = z.strictObject({
    email,
    password: z.string().min(10).max(72),
});

const loginSchema = z.strictObject({
    email,
    password: z.string().min(1).max(72),
});

module.exports = { registerSchema, loginSchema };