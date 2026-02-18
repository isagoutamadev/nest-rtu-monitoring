import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('m_user_role', function (table) {
        table
            .integer('id_m_user')
            .notNullable()
            .references('m_users.id');
        table
            .integer('id_m_role')
            .notNullable()
            .references('m_roles.id');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('m_user_role');
}
