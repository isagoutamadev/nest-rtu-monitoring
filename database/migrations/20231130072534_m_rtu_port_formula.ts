import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('m_rtu_port_formula', function (table) {
        table.increments('id').primary().notNullable();
        table.uuid('uuid').unique().notNullable();
        table.integer('id_m_rtu_port').unsigned().notNullable().references('m_rtu_ports.id').onDelete('cascade');
        table.integer('id_m_formula').unsigned().notNullable().references('m_formulas.id').onDelete('cascade');;
        table.text('formula').notNullable().comment('formula with variable replaced');
        table.string('metrics').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('m_rtu_port_formula');
}