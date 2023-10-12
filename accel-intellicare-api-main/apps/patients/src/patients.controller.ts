import { Controller, Get, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { Patients, UserApp } from '@app/database/entities';
import { JwtAuthGuard, AllowedGroups } from '@auth/auth/groups.guard';
import { DatabaseService } from '@app/database';
import { PatientsService } from './patients.service';
import { Crud, CrudController } from '@rewiko/crud';
import { createQueryBuilder, DataSource } from 'typeorm';

@Crud({
  model: {
    type: Patients,
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
      userApp: {
        eager: true,
        //exclude: ['id', 'email'],
      }
    },
  },
})

@UseGuards(JwtAuthGuard)
@Controller({
  path: 'api',
  version: '1',
})

export class PatientsController implements CrudController<Patients>
{
  constructor(
    readonly service: PatientsService,
    readonly dbService: DatabaseService,
    readonly dataSource: DataSource,
  ) {}

  get base(): CrudController<Patients> {
    return this;
  }

  /**
   * 
   * @returns {Promise} Patient list
   */
  @AllowedGroups(['client','admin'])
  @Get()
  async findAll() : Promise<Patients>{

    try{
      const resultData = await this.service.patientsList();

      if(!resultData){
        throw new HttpException(
          'No results were found',
          HttpStatus.NO_CONTENT,
        );
      }
      return resultData;

    } catch (error) {
      throw new HttpException(error.response, HttpStatus.BAD_REQUEST);
    }
  }
}

