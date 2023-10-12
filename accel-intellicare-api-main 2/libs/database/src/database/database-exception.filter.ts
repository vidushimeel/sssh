import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { HttpAdapterHost } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx: HttpArgumentsHost = host.switchToHttp();
    let httpStatus: number;
    let responseBody: any;
    if (exception instanceof QueryFailedError) {
      if (exception.driverError.code === 'ER_DUP_ENTRY') {
        httpStatus = HttpStatus.CONFLICT;
      } else {
        httpStatus = HttpStatus.BAD_REQUEST;
      }
      responseBody = {
        statusCode: httpStatus,
        message: JSON.stringify(exception.message),
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
      };
    } else {
      httpStatus =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      console.log('error ', exception);
      responseBody = {
        statusCode: httpStatus,
        message: exception.getResponse(),
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
      };
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
