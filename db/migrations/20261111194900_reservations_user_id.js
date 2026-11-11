const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');

function emailFromName(name) {
    const slug = name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ł/g, 'l')
        .replace(/Ł/g, 'L')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '.')
        .replace(/^\.+|\.+$/g, '');
    return `${slug || 'user'}@example.com`;
}

exports.up = async function (knex) {
    await knex.schema.alterTable('reservations', table => {
        table.integer('user_id')
            .references('id').inTable('users')
            .onDelete('RESTRICT');
    });

    const names = await knex('reservations').distinct('reserved_by').pluck('reserved_by');

    for (const name of names) {
        const email = emailFromName(name);

        let user = await knex('users').where({ email }).first();
        if (!user) {
            const randomPassword = crypto.randomBytes(32).toString('hex');
            [user] = await knex('users')
                .insert({
                    email,
                    password_hash: bcrypt.hashSync(randomPassword, 10),
                    role: 'USER',
                })
                .returning('*');
        }

        await knex('reservations').where({ reserved_by: name }).update({ user_id: user.id });
    }

    await knex.schema.alterTable('reservations', table => {
        table.integer('user_id').notNullable().alter();
        table.dropColumn('reserved_by');
        table.index(['user_id'], 'reservations_user_id_idx');
    });
};

exports.down = async function (knex) {
    await knex.schema.alterTable('reservations', table => {
        table.string('reserved_by', 100);
    });

    await knex.raw(`
        UPDATE reservations r
        SET reserved_by = u.email
        FROM users u
        WHERE u.id = r.user_id
    `);

    await knex.schema.alterTable('reservations', table => {
        table.string('reserved_by', 100).notNullable().alter();
        table.dropIndex(['user_id'], 'reservations_user_id_idx');
        table.dropColumn('user_id');
    });
};


