import { User } from '@app/database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@rewiko/crud-typeorm';
import AWS = require('aws-sdk');
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { generatePassword } from './userHelpers';

import {
  AdminGetUserRequest,
  CreateGroupRequest,
  GetGroupRequest,
  InitiateAuthRequest,
  AdminUpdateUserAttributesRequest,
  AttributeListType,
} from 'aws-sdk/clients/cognitoidentityserviceprovider';


@Injectable()
export class UsersService extends TypeOrmCrudService<User> {

  private DELIVERY_MEDIUM = 'EMAIL';
  private EMAIL_USR_ATTRB = 'email';
  private GIVEN_NAME_USR_ATTRB = 'given_name';
  private FAMILY_NAME_USR_ATTRB = 'family_name';
  private EMAIL_VERIFIED_USR_ATTRB = 'email_verified';
  private STATE_ENABLED = 2;
  private STATE_DISABLED = 3;

  private cognitoIdentityServiceProvider: CognitoIdentityServiceProvider;

  constructor(@InjectRepository(User) repo) {
    super(repo);

    this.cognitoIdentityServiceProvider =
    new AWS.CognitoIdentityServiceProvider({
      region: process.env.COGNITO_REGION,
    });
  }

  /***
   * Creates a user in Cognito AWS
   */
  createCognitoUser(data: User, recievedPassword): Promise<any> {
    const { email, firstName, lastName, middleName } = data;
    const password = recievedPassword;
    const poolData = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: email,
      DesiredDeliveryMediums: [this.DELIVERY_MEDIUM],
      TemporaryPassword: password,
      UserAttributes: [
        {
          Name: this.EMAIL_USR_ATTRB,
          Value: email,
        },
        {
          Name: this.GIVEN_NAME_USR_ATTRB,
          Value: `${firstName}${middleName ? middleName : ''}`,
        },
        {
          Name: this.FAMILY_NAME_USR_ATTRB,
          Value: lastName,
        },
        {
          Name: this.EMAIL_VERIFIED_USR_ATTRB,
          Value: 'true',
        },
        // {
        //   Name: this.PROFILE,
        //   Value: type.name,
        // },
      ],
    };

    return new Promise((resolve, reject) => {
      console.log('Calling to Cognito');
      this.cognitoIdentityServiceProvider.adminCreateUser(
        poolData,
        (error, data) => {
          if (!error) {
            console.log('Congnito data: ', data);
            resolve(data);
          } else {
            console.log('Congnito error: ', error);
            reject(error);
          }
        },
      );
    });
  }

  async findByNames(user: User): Promise<void | User> {
    const query = this.repo
      .createQueryBuilder('users_api')
      .where('users_api.first_name = :first_name', {
        first_name: user.firstName,
      })
      .andWhere('users_api.middle_name = :middle_name', {
        middle_name: user.middleName,
      })
      .andWhere('users_api.last_name = :last_name', {
        last_name: user.lastName,
      });
    if (user.id)
      query.andWhere('users_api.id != :id', {
        id: user.id,
      });
    return query.getOne();
  }

  async setPassword(username: string, password: string): Promise<any> {
    console.log(
      '🚀 ~ file: users.service.ts ~ line 363 ~ UsersService ~ setPassword ~ password',
      password,
    );
    const params = {
      Password: password,
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: username,
      Permanent: true,
    };

    return new Promise((resolve, reject) => {
      this.cognitoIdentityServiceProvider.adminSetUserPassword(
        params,
        function (error, data) {
          if (error) {
            console.log(
              'Cognito error setting the password: ',
              error,
              error.stack,
            );
            reject(error);
          } else {
            console.log('setting the password', data);
            resolve(data);
          }
        },
      );
    });
  }

  async addGroupCognitoUser(data: User, username): Promise<any> {
    let groupName = '';
    groupName = "client";
    const params = {
      GroupName: groupName,
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: username,
    };

    const paramsGetGroup: GetGroupRequest = {
      GroupName: groupName,
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
    };
    try {
      await this.cognitoIdentityServiceProvider
        .getGroup(paramsGetGroup)
        .promise();
    } catch (error) {
      const paramsCreateGroup: CreateGroupRequest = {
        GroupName: groupName,
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
      };
      await this.cognitoIdentityServiceProvider
        .createGroup(paramsCreateGroup)
        .promise();
    }

    return new Promise((resolve, reject) => {
      this.cognitoIdentityServiceProvider.adminAddUserToGroup(
        params,
        function (error, data) {
          if (error) {
            console.log('Congnito error add GroupName: ', error, error.stack);
            reject(error);
          } else {
            console.log('Add GroupName', data);
            resolve(data);
          }
        },
      );
    });
  }

  async findCognitoUserByEmail(
    email: string,
    base64Password: string,
  ): Promise<any> {
    const params: AdminGetUserRequest = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: email,
    };

    const authParams: InitiateAuthRequest = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: Buffer.from(base64Password, 'base64').toString('ascii'),
      },
    };
    /**Just Checking if the user and password is ok */
    const user = new Promise((resolve, reject) => {
      this.cognitoIdentityServiceProvider.adminGetUser(
        params,
        function (error, data) {
          if (error) {
            reject(error);
          } else {            
            resolve(data);
          }
        },
      );
    });
    const auth = new Promise((resolve, reject) => {
      this.cognitoIdentityServiceProvider.initiateAuth(
        authParams,
        function (error, data) {
          if (error) {
            reject(error);
          } else {            
            resolve(data);
          }
        },
      );
    });

    return Promise.all([user, auth]).then(values => {
      Object.assign(values[0], values[1]);
      return values[0];
    });
  }

  async createUserDB(userDto: User
  ): Promise<User> {
    return this.repo.save(userDto);
  }

}
