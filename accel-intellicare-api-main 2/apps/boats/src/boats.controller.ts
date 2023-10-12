import { Boat } from '@app/database/entities';
import { DatabaseService } from '@app/database';
import { Controller, Get } from '@nestjs/common';
import { BoatsService } from './boats.service';
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
  },
})
//@UseGuards(JwtAuthGuard)
@Controller({
  path: 'api',
  version: '1',
})
export class BoatsController implements CrudController<Boat> {
  constructor(
    readonly service: BoatsService,
    readonly dbService: DatabaseService,
  ) {}

  get base(): CrudController<Boat> {
    return this;
  }

  @Get('cats')
  findAllV1(): string {
    return 'This action returns all cats for version 1 edited';
  }
}
