import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { DefinitionType, ValueDefinition } from '../../entities/';

export default class CreateValuesDefinitions implements Seeder {
  valueDefinitions: ValueDefinition[] = [
    /*****************************USER_STATUS*****************************/
    {
      valueDefinition: '010',
      description: 'Active',
      active: true,
      creatorUserId: 'demo-app',
      definitionType: { definitionType: 'USER_STATUS' },
      createdAt: new Date(),
    },
    {
      valueDefinition: '020',
      description: 'Draft',
      active: true,
      creatorUserId: 'demo-app',
      definitionType: { definitionType: 'USER_STATUS' },
      createdAt: new Date(),
    },
    {
      valueDefinition: '030',
      description: 'Invited',
      active: true,
      creatorUserId: 'demo-app',
      definitionType: { definitionType: 'USER_STATUS' },
      createdAt: new Date(),
    },
    {
      valueDefinition: '040',
      description: 'Deactive',
      active: true,
      creatorUserId: 'demo-app',
      definitionType: { definitionType: 'USER_STATUS' },
      createdAt: new Date(),
    },
    {
      valueDefinition: '050',
      description: 'Blocked',
      active: true,
      creatorUserId: 'demo-app',
      definitionType: { definitionType: 'USER_STATUS' },
      createdAt: new Date(),
    },
    {
      valueDefinition: '060',
      description: 'Archived',
      active: true,
      creatorUserId: 'demo-app',
      definitionType: { definitionType: 'USER_STATUS' },
      createdAt: new Date(),
    },
    /*****************************USER_TYPES*****************************/
    {
      valueDefinition: '010',
      description: 'Employees',
      active: true,
      creatorUserId: 'demo-app',
      definitionType: { definitionType: 'USER_TYPES' },
      createdAt: new Date(),
    },
    {
      valueDefinition: '020',
      description: 'Organizations',
      active: true,
      creatorUserId: 'demo-app',
      definitionType: { definitionType: 'USER_TYPES' },
      createdAt: new Date(),
    },
    {
      valueDefinition: '030',
      description: 'System',
      active: true,
      creatorUserId: 'demo-app',
      definitionType: { definitionType: 'USER_TYPES' },
      createdAt: new Date(),
    },
    /*****************************USER_ROLES*****************************/
    {
      valueDefinition: '010',
      description: 'Basic',
      active: true,
      creatorUserId: 'demo-app',
      definitionType: { definitionType: 'USER_ROLES' },
      createdAt: new Date(),
    },
    {
      valueDefinition: '020',
      description: 'Admin',
      active: true,
      creatorUserId: 'demo-app',
      definitionType: { definitionType: 'USER_ROLES' },
      createdAt: new Date(),
    },
    {
      valueDefinition: '030',
      description: 'Super Admin',
      active: true,
      creatorUserId: 'demo-app',
      definitionType: { definitionType: 'USER_ROLES' },
      createdAt: new Date(),
    },
  ];

  public async run(
    dataSource: DataSource,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _factoryManager: SeederFactoryManager,
  ): Promise<any> {
    try {
      for (const valueDefinition of this.valueDefinitions) {
        //Retrieve Definition type Id
        const definitionType: DefinitionType = await dataSource
          .getRepository(DefinitionType)
          .findOneBy({
            definitionType: valueDefinition.definitionType.definitionType,
          });
        valueDefinition.definitionType = definitionType;
        const count: number = await dataSource
          .getRepository(ValueDefinition)
          .countBy({
            valueDefinition: valueDefinition.valueDefinition,
            definitionType: valueDefinition.definitionType,
          });
        if (count == 0) {
          await dataSource
            .createQueryBuilder()
            .insert()
            .into(ValueDefinition)
            .values(valueDefinition)
            .execute();
        } else {
          //alow update names
          const valueDefinitionDB: ValueDefinition = await dataSource
            .getRepository(ValueDefinition)
            .findOneBy({
              valueDefinition: valueDefinition.valueDefinition,
              definitionType: valueDefinition.definitionType,
            });
          if (valueDefinitionDB.description !== valueDefinition.description) {
            valueDefinitionDB.description = valueDefinition.description;
            valueDefinitionDB.validationType = valueDefinition.validationType;
            await dataSource
              .getRepository(ValueDefinition)
              .save(valueDefinitionDB);
          }
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
