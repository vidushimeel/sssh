import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { Crud, CrudController, CrudRequest, ParsedRequest, ParsedBody} from '@rewiko/crud';

import { JwtAuthGuard, AllowedGroups } from '@auth/auth/groups.guard';

import { Boat, User, ValueDefinition } from '@app/database/entities';
import { DatabaseService } from '@app/database';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { generatePassword } from './userHelpers';
import { UserStatusEnum } from 'custom/enum/user-status-enum';
import { UserTypesEnum } from 'custom/enum/user-types-enum';
import { UserRolesEnum } from 'custom/enum/user-roles-enum';
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
    //cache: 1800000,
    join: {
      status: {
        eager: false,
        alias: 'userStatus',
      },
      type: {
        eager: false,
        alias: 'userType',
      },
      role: {
        eager: false,
        alias: 'userRole',
      },
    },
  },
})
@ApiTags('Endpoints for Users')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'api',
  version: '1',
})
export class UsersController implements CrudController<User> {
  constructor(
    readonly service: UsersService,
    readonly dbService: DatabaseService,
  ) {}

  get base(): CrudController<User> {
    return this;
  }

  @AllowedGroups(['admin'])
  @Post("create")  
  async createOne(
    @Body() request: User
  ) {        
    try {
      
      // Temp: To create some records in DB only
      //Connection with Cognito to register the new user and get de cognito_id
      //check if user with same name exist

      const userDto: User = {id:null,middleName:null,name:null,subCognitoId:null,homeAddress:null,dateInvited:null,dateRegistered:null,lastLogin:null,photo_url:null,createdAt:null,creatorUserId:'',updatedAt:null,modifierUserId:null,status:null,type:null,role:null,phone:request.phone,email:request.email,firstName:request.firstName,lastName:request.lastName,}      

      const dbUser = await this.service.findByNames(userDto);

      if (dbUser) {
        throw new HttpException(
          'USERS.USERS_NAMES_UK:: And user with the same first_name, middle_name, last_name already exist in the system',
          HttpStatus.CONFLICT,
        );
      }      

      const password = generatePassword()

      const cognitoUser = await this.service.createCognitoUser(userDto, password);
      console.log('cognitoUser: ', cognitoUser);

      //Add needed info
      userDto.subCognitoId = cognitoUser.User.Username;      

      console.log("Password")
      console.log(password)

      await this.service.setPassword(userDto.email, password);
      await this.service.addGroupCognitoUser(userDto, userDto.email);

      //Add invited date
      userDto.createdAt = new Date();

      //Add register date
      userDto.updatedAt = new Date();

      userDto.status = await this.dbService.getValueDefinitionId(
        'USER_STATUS',
        '010',
      );
      userDto.type = await this.dbService.getValueDefinitionId(
        'USER_TYPES',
        '020',
      );
      userDto.role = await this.dbService.getValueDefinitionId(
        'USER_ROLES',
        '010',
      );
      
      if (userDto.firstName) {
        const name = `${userDto.firstName} ${userDto.middleName ?? ''}${
          userDto.middleName ? ' ' : ''
        }${userDto.lastName}`;
        userDto.name = name;
      }

      //Create user in 360DB
      const userDB: User = await this.service.createUserDB(userDto);
      
      console.log('Return', userDB);
      return userDB;
    } catch (error) {
      console.log("Unmanage error")
      console.log(error)
      if (error instanceof HttpException) throw error;
      console.log('Error creating user: ', error);
      console.log('error.code: ', error.code);
      throw new HttpException(
        error.code === 'ER_DUP_ENTRY' ||
        error.code === 'UsernameExistsException'
          ? error.message
          : error,
        error.code === 'UsernameExistsException' ||
        error.code === 'ER_DUP_ENTRY' ||
        error.status === 409
          ? HttpStatus.CONFLICT
          : HttpStatus.BAD_REQUEST,
      );
    }
  }

  @AllowedGroups(['public'])
  @Get('logUser/publicInfo/:email/:base64Password')  
  async userInfo(
    @Param('email') email: string,
    @Param('base64Password') base64Password: string,
  ) {
    try {
      const cognitoUser = await this.service.findCognitoUserByEmail(
        email,
        base64Password,
      );
      return cognitoUser;
    } catch (error) {
      console.log(
        '🚀 ~ file: users.controller.ts ~ line 313 ~ UsersController ~ error',
        error,
      );
      if (error.code === 'UserNotFoundException')
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      if (error.code === 'NotAuthorizedException')
        throw new HttpException(
          'Invalid Email or Password',
          HttpStatus.UNAUTHORIZED,
        );
      throw new HttpException(
        'Error retrieving user information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
