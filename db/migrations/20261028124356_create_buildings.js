exports.up = async function (knex) {
    await knex.schema.createTable('buildings', table => {
        table.increments('id').primary();
        table.string('name', 100).notNullable().unique();
        table.string('address', 200).notNullable();
        table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTable('buildings');
};


