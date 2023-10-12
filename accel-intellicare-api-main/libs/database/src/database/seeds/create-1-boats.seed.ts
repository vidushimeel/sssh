import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Boat } from '../../entities/boat.entity';

export default class CreateBoats implements Seeder {
  boats = [
    {
      id: 31,
      name: '272CC',
      make: 'Blackfin',
      length_in_feet: 27,
      created_at: '2022-03-31T05:00:00.000Z',
      created_by_id: '1580A5CD-5DE1-E7C1-941D-F89AD87923F7',
      updated_at: '2022-03-31T05:00:00.000Z',
      modified_by_id: '01C192B1-E1FA-2D66-7118-B7A19487D765',
    },
    {
      id: 32,
      name: '280 Outrage',
      make: 'Boston Whaler',
      length_in_feet: 28,
      created_at: '2022-03-31T05:00:00.000Z',
      created_by_id: '1580A5CD-5DE1-E7C1-941D-F89AD87923F7',
      updated_at: '2022-03-31T05:00:00.000Z',
      modified_by_id: '01C192B1-E1FA-2D66-7118-B7A19487D765',
    },
    {
      id: 33,
      name: '263',
      make: 'Calcutta',
      length_in_feet: 26,
      created_at: '2022-03-31T05:00:00.000Z',
      created_by_id: '1580A5CD-5DE1-E7C1-941D-F89AD87923F7',
      updated_at: '2022-03-31T05:00:00.000Z',
      modified_by_id: '01C192B1-E1FA-2D66-7118-B7A19487D765',
    },
    {
      id: 34,
      name: '28 HB',
      make: 'Caymas',
      length_in_feet: 28,
      created_at: '2022-03-31T05:00:00.000Z',
      created_by_id: '1580A5CD-5DE1-E7C1-941D-F89AD87923F7',
      updated_at: '2022-03-31T05:00:00.000Z',
      modified_by_id: '01C192B1-E1FA-2D66-7118-B7A19487D765',
    },
    {
      id: 35,
      name: '301 CC',
      make: 'Cobia',
      length_in_feet: 30,
      created_at: '2022-03-31T05:00:00.000Z',
      created_by_id: '1580A5CD-5DE1-E7C1-941D-F89AD87923F7',
      updated_at: '2022-03-31T05:00:00.000Z',
      modified_by_id: '01C192B1-E1FA-2D66-7118-B7A19487D765',
    },
  ];

  public async run(
    dataSource: DataSource,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _factoryManager: SeederFactoryManager,
  ): Promise<any> {
    for (const item of this.boats) {
      try {
        const count: number = await dataSource
          .getRepository(Boat)
          .countBy({ name: item.name });
        if (count == 0)
          await dataSource
            .createQueryBuilder()
            .insert()
            .into(Boat)
            .values(item)
            .execute();
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(
            `ℹ️::: This Boat ${JSON.stringify(item)} already exists 🤟`,
          );
        } else {
          console.log(error);
          throw new Error(error.message);
        }
      }
    }
  }
}
