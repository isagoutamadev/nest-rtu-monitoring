import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('m_formulas', function (table) {
        table.increments('id').primary().notNullable();
        table.uuid('uuid').unique().notNullable();
        table.string('identifier').notNullable();
        table.string('name').notNullable();
        table.enu('mode', ['analog', 'digital']).notNullable();
        table.text('formula').notNullable();
        table.string('unit').notNullable();
        table.string('description').nullable();
        table.tinyint('is_specific_port').unsigned().notNullable().defaultTo(0);
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
    return knex.schema.dropTable('m_formulas');
}
