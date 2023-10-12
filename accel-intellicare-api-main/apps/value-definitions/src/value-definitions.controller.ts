import { Boat, ValueDefinition } from '@app/database/entities';
import { DatabaseService } from '@app/database';
import { Controller } from '@nestjs/common';
import { ValueDefinitionsService } from './value-definitions.service';
import { Crud, CrudController } from '@rewiko/crud';

@Crud({
  model: {
    type: Boat,
  },
  routes: {
    getManyBase: {
      // decorators: [AllowedGroups(['system', 'admin'])],
    },
    getOneBase: {
      // decorators: [AllowedGroups(['system', 'admin'])],
    },
    createOneBase: {
      // decorators: [AllowedGroups(['system', 'admin'])],
    },
    createManyBase: {
      // decorators: [AllowedGroups(['system', 'admin'])],
    },
    updateOneBase: {
      // decorators: [AllowedGroups(['system', 'admin'])],
    },
    replaceOneBase: {
      // decorators: [AllowedGroups(['system', 'admin'])],
    },
    deleteOneBase: {
      // decorators: [AllowedGroups(['system', 'admin'])],
    },
  },
  query: {
    alwaysPaginate: false,
    cache: 1800000,
    join: {
      definitionType: {
        eager: false,
        alias: 'valueDefinitionType',
      },
    },
  },
})
//@UseGuards(JwtAuthGuard)
@Controller({
  path: 'api',
  version: '1',
})
export class ValueDefinitionsController implements CrudController<ValueDefinition>
{
  constructor(
    readonly service: ValueDefinitionsService,
    readonly dbService: DatabaseService,
  ) {}

  get base(): CrudController<ValueDefinition> {
    return this;
  }
}
