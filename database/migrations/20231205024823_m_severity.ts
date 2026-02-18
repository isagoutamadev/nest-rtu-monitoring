import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('m_severity', function (table) {
        table.increments('id').primary().notNullable();
        table.string('title').notNullable();
        table.string('color').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('m_severity');
}