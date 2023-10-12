import { INestApplication, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@vendia/serverless-express';
import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { AppointmentMeetingsModule } from './appointment-meetings.module';
import { SwaggerModule, DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app: INestApplication = await NestFactory.create(
    AppointmentMeetingsModule,
  );

  const config = new DocumentBuilder()
    .setTitle('Visits')
    .setDescription('API documentation.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  const customOptions: SwaggerCustomOptions = {
    customSiteTitle: 'ACCEL API Docs',
    url: 'pruebas/reload',
    swaggerUrl: 'masdatos/totest/'
  }
  SwaggerModule.setup('docs', app, document, customOptions);



  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI,
  });
  await app.init();

  const expressApp: any = app.getHttpAdapter().getInstance();
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
