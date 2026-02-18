import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('m_formula_tresholds', function (table) {
        table.increments('id').primary().notNullable();
        table.uuid('uuid').unique().notNullable();
        table.integer('id_m_severity').unsigned().references('m_severity.id').notNullable();
        table.integer('id_m_formula').unsigned().references('m_formulas.id').notNullable();
        table.string('rule').notNullable();
        table.string('label').notNullable();
        table.integer('duration').unsigned().notNullable().defaultTo(5).comment("second");
        table.text('description').nullable();
        table.integer('created_by').unsigned().notNullable().defaultTo(0);
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
    return knex.schema.dropTable('m_formula_tresholds');
}