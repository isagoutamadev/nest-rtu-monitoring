import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('m_mds', function (table) {
        table.increments('id').primary().notNullable();
        table.uuid('uuid').unique().notNullable();
        table.integer('id_m_rrd').unsigned().references('m_rrds.id').notNullable();
        table.integer('id_m_location').unsigned().references('m_locations.id').nullable();
        table.integer('id_m_md_backup').unsigned().references('m_mds.id').nullable();
        table.string('ip_address').notNullable();
        table.integer('port').unsigned().notNullable();
        table.string('name').notNullable();
        table.string('sname').notNullable();
        table.tinyint('is_virtual').notNullable();
        table.tinyint('is_backup').notNullable();
        table.enum('status', ['normal', 'off', 'error']).notNullable().defaultTo('off');
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
    return knex.schema.dropTable('m_mds');
}