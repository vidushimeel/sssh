import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Appointment, AppointmentMeeting, Boat, DefinitionType, OrganizationMembers, Patients, User, UserApp, ValueDefinition, Sites } from './entities';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './database/database-exception.filter';
import { TranscriptionMeetings } from './entities/transcriptionMeetings.entity';

const ENTITIES: any[] = [Boat, User, ValueDefinition, DefinitionType, UserApp, Patients, Appointment, AppointmentMeeting, TranscriptionMeetings, OrganizationMembers, Sites];

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      timezone: '+00:00', //UTC
      autoLoadEntities: true,
      synchronize: false,
      namingStrategy: new SnakeNamingStrategy(),
      logging: ['error'],
    }),
    TypeOrmModule.forFeature(ENTITIES),
  ],
  providers: [
    DatabaseService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [DatabaseService],
})
export class DbLibraryModule {}
