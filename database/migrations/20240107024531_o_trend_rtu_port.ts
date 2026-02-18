import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('o_trend_rtu_port', function (table) {
        table.integer('id_m_rtu_port').unsigned().notNullable().references('m_rtu_ports.id');
        table.integer('avg_value').nullable();
        table.integer('max_value').nullable();
        table.integer('min_value').nullable();
        table.integer('time').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('o_trend_rtu_port');
}