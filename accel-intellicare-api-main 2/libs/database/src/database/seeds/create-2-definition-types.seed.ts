import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { DefinitionType } from '../../entities/definitionType.entity';

export default class CreateDefinitionTypes implements Seeder {
  definitionTypes: DefinitionType[] = [
    {
      definitionType: 'USER_STATUS',
      description: 'Group of values for user status',
      active: true,
      creatorUserId: 'demo-app',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      definitionType: 'USER_TYPES',
      description: 'Group of values for  user types',
      active: true,
      creatorUserId: 'demo-app',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      definitionType: 'USER_ROLES',
      description: 'Group of values for  user roles',
      active: true,
      creatorUserId: 'demo-app',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  public async run(
    dataSource: DataSource,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _factoryManager: SeederFactoryManager,
  ): Promise<any> {
    try {
      for (const definitionType of this.definitionTypes) {
        const count: number = await dataSource
          .getRepository(DefinitionType)
          .countBy({ definitionType: definitionType.definitionType });
        if (count == 0) {
          await dataSource
            .createQueryBuilder()
            .insert()
            .into(DefinitionType)
            .values(definitionType)
            .execute();
        }
      }
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('There is no need to create the definition type');
      } else {
        throw new Error(error.message);
      }
    }
  }
}
