import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Inserts seed entries
    await knex('m_severity').insert([
        {
            title: 'Off',
            color: '#170F0F',
            id: 5,
        },
        {
            title: 'Critical',
            color: '#EC406C',
            id: 4,
        },
        {
            title: 'Danger',
            color: '#FD986B',
            id: 3,
        },
        {
            title: 'Warning',
            color: '#F9C747',
            id: 2,
        },
        {
            title: 'Normal',
            color: '#5DCD89',
            id: 1,
        },
    ]);
}
