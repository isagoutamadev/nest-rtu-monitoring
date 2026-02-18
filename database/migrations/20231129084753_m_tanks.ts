import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('m_tanks', function (table) {
        table.increments('id').primary().notNullable();
        table.uuid('uuid').unique().notNullable();
        table.integer('id_m_tank_form').unsigned().nullable().references('m_tank_form.id');
        table.integer('id_m_rtu_port').unique().unsigned().notNullable().references('m_rtu_ports.id').onDelete('cascade');
        table.string('name').notNullable();
        table.enu('type', ['bulanan', 'harian']).notNullable();
        table.float('tank_capacity').notNullable().comment('Liter');
        table.float('tank_length').notNullable().comment('cm');
        table.float('tank_height').notNullable().comment('cm');
        table.float('tank_wide').notNullable().comment('cm');
        table.float('engine_capacity').notNullable().comment('');
        table.float('power').notNullable().comment('');
        table.float('fuel_consumption').notNullable().comment('Liter');
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
    return knex.schema.dropTable('m_tanks');
}