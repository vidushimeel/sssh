![RevStar Consulting](images/revstar-serverless.png?raw=true 'RevStar Consulting Logo')

# RevStar Serverless template project for use NodeJS

This project is designed to allow developers to deploy their microservices to AWS as Lambda functions as REST APIs. While this template project is pre-configured for use with MySQL, it can easily be configured for use with PostgreSQL.

Architecturally, we deploy applications using a Services pattern as defined [here](https://www.serverless.com/blog/serverless-architecture-code-patterns). This project has been designed with possible shared dependencies in mind while maintaining a separation of concerns between the individually deployable functions. Our primary goal is to avoid monolithic architectures in our functions.

You may run the functions that are part of this application locally, but is also designed to work with standard RevStar CI/CD deployment pipelines. Configurations maintained in `serverless.yml` are used to package your Lambda functions and act as a point of reference to help our DevOps teams configure your applications correctly. However, we do not make use of `serverless deploy` in our pipelines; instead, we run `serverless package` and we use CDK to configure and deploy your Lambda functions, manage their permissions, API Gateway configurations, and more.

## Dependencies

These are the current global libraries needed to run the project.

- Webpack, Typescript, and dotenv
- NodeJS Version 16
- Serverless Version 3

Dependencies that you will need to install manually:

```
  npm install -g --silent --no-progress npm@8.19.1
  npm install -g --silent --no-progress serverless@3.22.0
  npm install -g --silent --no-progress @nestjs/cli@9.1.1
  npm install -g --silent --no-progress ts-node@10.9.1
```

## Project structure

- `apps/` - Lambda function source directories
- `dotenv/` - used solely for automated tests
- `libs/` - application code shared by all functions
- `libs/database/src/entities/` - TypeORM entity mapping definitions
- `libs/database/src/database/migrations` - database schema initialization scripts and database migrations scripts to be executed by TypeORM
- `libs/database/src/database/seeds` - database seeding scripts to be executed by TypeORM
- `serverless.yml` - Serverless application configuration

## Quickstart

This project contains two fully defined sample functions that you can use to get up and running quickly. To get started with this project, simply run the following commands:

```
serverless create \
  -u https://github.com/revstarconsulting/serverless-aws-nodejs-and-rds \
  -n my-serverless-project
```

Next, configure your application by copying [.env.example](.env.example) to `.env`:

```
cp .env.example .env
```

To run the application locally, we will also need to run a MySQL database. You can use the [docker-compose.yml](docker-compose.yml)

```
docker-compose up -d
```

Using the MySQL CLI, login to the database using the `root` user and the password value from `.env`, and create the schema defined in `.env`:

```
mysql -h 0.0.0.0 -u revstar -p"revstar"
mysql>CREATE DATABASE revstar;
```

Then, you need to initialize the database schema as well as run the database seeding scripts by executing `npm run migrations:run`

Finally, with your database up and running, execute `npm run serverless:run` to run the application locally. This will build and run serverless offline using typescript.

After your application initializes, you can access your APIs via http://localhost:3500

Accessing the example

```curl
GET http://localhost:3500/local/boats/v1/api/
GET http://localhost:3500/local/boats/v1/api/cats
```

## TypeORM

This project utilizes TypeORM for Object mapping, database migrations, and uses typeorm-seeding for seeding / populating the database. This document does not provide details about how to develop those migrations scripts. It is expected that developers will build their migrations and place those scripts under `libs/database/src/database/migrations`. Database seeding scripts are defined under `libs/database/src/database/seeds`. Once defined, database scripts can be executed using `npm run migrations:run`

### Creating new entities and migrations

To create a new Entity: https://github.com/typeorm/typeorm/blob/master/docs/using-cli.md#create-a-new-entity

use the following examples:

```bash
typeorm entity:create -n User -d libs/database/src/entities
```

or

```bash
npm run entity:create  User
```

To create a new Migration: https://github.com/typeorm/typeorm/blob/master/docs/using-cli.md#create-a-new-migration

use the following examples:

```bash
typeorm migration:create -n UserMigration -d libs/database/src/database/migrations
```

or

```bash
npm run migrations:create UserMigration
```

### Creating new seeders

Seeding scripts exist under `libs/database/src/database/seeds`. Follow the `typeorm-seeding` docs to understand how to create new seeders: https://github.com/w3tecch/typeorm-seeding#-basic-seeder.

## Creating a new function

From the project directory, execute the following command: `nest generate app myfunction`. The source and scaffolding for your new function will be generated under the `apps` directory.

The generated function handler will need to be updated because the function generated by NestJS will not work as an AWS Lambda function. The `main.ts` file needs to be updated to look like this (fix the module importing according the new app):

```typescript
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@vendia/serverless-express';
import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { BoatsModule } from './boats.module';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(BoatsModule);
  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI,
  });
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback,
) => {
  if (
    event.body &&
    event.headers['Content-Type'].includes('multipart/form-data')
  ) {
    // before => typeof event.body === string
    event.body = Buffer.from(event.body, 'binary') as unknown as string;
    // after => typeof event.body === <Buffer ...>
  }
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
```

## SERVERLESS CONFIGURATION (BOTH STEPS REQUIRED)

### LOCAL DEVELOPMENT

we are using `serverless-plugin-typescript` to work locally

Update `serverless.local.yml` to include the necessary configuration for your new function. For example:

```yaml
functions:
  myFunction:
    handler: apps/myFunction/src/main.handler
    events:
      - http:
          method: ANY
          path: /myFunction
      - http:
          method: ANY
          path: '/myFunction/{proxy+}'
```

### AWS ENVIRONMENTS

Update `serverless.yml` to include the necessary configuration for your new function. For example:

```yaml
functions:
  myFunction:
    handler: dist/apps/myFunction/main.handler
    events:
      - http:
          method: ANY
          path: /myFunction
      - http:
          method: ANY
          path: '/myFunction/{proxy+}'
    package:
      patterns:
        - dist/apps/myFunction/**
```

## TODO

- document how the authorization component works
- document how to layer in @rewiko/crud components as was done with the example `boats` function
- include an example for how to change between MySQL and Postgres
- include documentation about how to add automated tests - unit tests, integration tests, bdd tests
- include build manifest in project

- examples support Websockets
- example to support Cognito's custom email sender
- example to support DynamoDB (does TypeORM support this backend?)
- example to support AppSync (AWS managed GraphQL)
