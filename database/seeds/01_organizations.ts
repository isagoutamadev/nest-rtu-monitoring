import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {

    // Inserts seed entries
    await knex("m_organizations").insert([
        { 
            id: 1,
            uuid: "17becd86-494e-4560-974c-250734ccce12", 
            name: "Head Office",
            level: 0,
            sname: "HO",
            created_by: 1
        },
    ]);
};
