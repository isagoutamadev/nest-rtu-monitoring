import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('m_device_type', function (table) {
        table.increments('id').primary().notNullable();
        table.uuid('uuid').unique().notNullable();
        table.string('name').notNullable();
        table.text('description').nullable();
        table.integer('created_by').unsigned().notNullable();
        table.integer('updated_by').unsigned().nullable();
        table
            .integer('created_at')
            .notNullable()
            .unsigned()
            .defaultTo(knex.raw('floor(extract(epoch from now()))'));
        table
            .integer('updated_at')
            .notNullable()
            .unsigned()
            .defaultTo(knex.raw('floor(extract(epoch from now()))'));
        table.tinyint('is_deleted').notNullable().defaultTo(0);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('m_device_type');
}