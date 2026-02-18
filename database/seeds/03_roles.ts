import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Inserts seed entries
    await knex("m_roles").insert([
        {
            id: 1,
            uuid: "43279dbf-402e-423c-9b5a-86cc5e6dfedc",
            name: "Super Admin",
            created_by: 1
        }
    ]);
};
