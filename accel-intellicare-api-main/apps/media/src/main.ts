import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@vendia/serverless-express';
import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { MediaModule } from './media.module';
import * as bodyParser from 'body-parser';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(MediaModule);
  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
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