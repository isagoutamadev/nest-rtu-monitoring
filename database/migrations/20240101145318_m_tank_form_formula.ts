import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('m_tank_form_formula', function (table) {
        table.integer('id_m_tank_form').unsigned().notNullable().references('m_tank_form.id');
        table.integer('id_m_formula').unsigned().notNullable().references('m_formulas.id');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('m_tank_form_formula');
}