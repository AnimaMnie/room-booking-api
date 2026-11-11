exports.up = async function (knex) {
    await knex.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('email', 254).notNullable().unique();
        table.string('password_hash', 60).notNullable();
        table.string('role', 10).notNullable().defaultTo('USER');
        table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

        table.check("?? IN ('USER', 'ADMIN')", ['role'], 'users_role_valid');
        table.check('?? = lower(??)', ['email', 'email'], 'users_email_lowercase');
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTable('users');
};