import { randomUUID } from "crypto";
import { Knex } from "knex";
import * as bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
    // Inserts seed entries
    await knex("m_users").insert([
        { 
            id: 1,
            uuid: randomUUID(),
            id_m_organization: 1,
            name: "Super Admin",
            username: "superadmin123",
            email: "superadmin@email.com",
            phone: "",
            password: bcrypt.hashSync('password', 8),
            is_ldap: 0,
            is_active: 1,
            created_by: 1,
        }
    ]);

    await knex("m_user_role").insert({
        id_m_user: 1,
        id_m_role: 1
    });
};
