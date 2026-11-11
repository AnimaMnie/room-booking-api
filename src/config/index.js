const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../../.env'), quiet: true });
const { z } = require('zod');

const envSchema = z.object({
    DATABASE_URL: z.url({
        protocol: /^postgres(ql)?$/,
        error: 'DATABASE_URL must be a valid postgres:// connection string',
    }),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
    JWT_EXPIRES_IN: z
        .string()
        .regex(/^\d+[smhd]$/, 'JWT_EXPIRES_IN must look like 15m, 10s, 1h or 7d')
        .default('15m'),
    PORT: z.coerce.number().int().positive().default(3000),
    STORAGE: z.enum(['knex', 'memory']).default('knex'),
    ADMIN_EMAIL: z.email('ADMIN_EMAIL must be a valid email'),
    ADMIN_PASSWORD: z.string().min(10, 'ADMIN_PASSWORD must be at least 10 characters long'),
    SEED_USER_PASSWORD: z.string().min(10, 'SEED_USER_PASSWORD must be at least 10 characters long'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error('Invalid configuration - application will not start:');
    for (const issue of result.error.issues) {
        const name = issue.path.join('.');
        const value = process.env[name];
        const reason = value === undefined ? 'missing' : issue.message;
        console.error(`  - ${name}: ${reason}`);
    }
    process.exit(1);
}

module.exports = { config: Object.freeze(result.data) };