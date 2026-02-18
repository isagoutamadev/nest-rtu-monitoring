import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('m_users', function (table) {
        table.increments('id').primary().notNullable();
        table.uuid('uuid').unique().notNullable();
        table.integer('id_m_organization').nullable().references('m_organizations.id');
        table.integer('id_m_api').unique().nullable().references('m_apis.id').comment('Jika tidak null maka akun API');
        table.string('username').notNullable();
        table.string('name').notNullable();
        table.string('email').nullable();
        table.string('phone').nullable();
        table.integer('telegram_id').nullable();
        table.string('telegram_username').nullable();
        table.string('description').nullable();
        table.tinyint('is_ldap').notNullable().defaultTo(0);
        table.tinyint('is_active').notNullable().defaultTo(0);
        table.tinyint('is_telegram_verified').notNullable().defaultTo(0);
        table.tinyint('is_telegram_approved').notNullable().defaultTo(0);
        table.tinyint('is_email_verified').notNullable().defaultTo(0);
        table.string('profile_picture').nullable();
        table.string('password').nullable().defaultTo(0);
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
    return knex.schema.dropTable('m_users');
}