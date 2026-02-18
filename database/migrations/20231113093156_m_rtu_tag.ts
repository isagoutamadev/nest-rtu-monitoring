import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('m_rtu_tag', function (table) {
        table
            .integer('id_m_rtu')
            .notNullable()
            .references('m_rtus.id')
            .onDelete('cascade');
        table
            .integer('id_m_tag')
            .notNullable()
            .references('m_tags.id')
            .onDelete('cascade');;
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('m_rtu_tag');
}