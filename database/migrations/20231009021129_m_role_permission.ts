import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('m_role_permission', function (table) {
        table
            .integer('id_m_role')
            .notNullable()
            .references('m_roles.id')
            .onDelete('cascade');
        table
            .integer('id_m_permission')
            .notNullable()
            .references('m_permissions.id')
            .onDelete('cascade');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('m_role_permission');
}
