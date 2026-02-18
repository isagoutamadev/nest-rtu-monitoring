import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('m_rtu_ports', function (table) {
        table.increments('id').primary().notNullable();
        table.uuid('uuid').unique().notNullable();
        table.integer('id_m_device_topology').unsigned().nullable().references('m_device_topology.id');
        table.integer('id_m_rtu').unsigned().notNullable().references('m_rtus.id').onDelete('cascade');
        table.integer('id_m_port').unsigned().notNullable().references('m_ports.id');
        table.tinyint('is_monitored').notNullable().defaultTo(1);
        table.tinyint('is_notified').notNullable().defaultTo(0);
        table.string('no_port').notNullable();
        table.text('description').nullable();
        table.string('metrics').notNullable();
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
    return knex.schema.dropTable('m_rtu_ports');
}