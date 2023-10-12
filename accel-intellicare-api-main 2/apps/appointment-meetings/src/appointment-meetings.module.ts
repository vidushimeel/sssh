import { DbLibraryModule } from '@app/database';
import { AppointmentMeeting } from '@app/database/entities';
import { AuthModule } from '@auth/auth';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentMeetingsServiceController } from './appointment-meetings.controller';
import { AppointmentMeetingsService } from './appointment-meetings.service';

@Module({
  imports: [DbLibraryModule, TypeOrmModule.forFeature([AppointmentMeeting]), AuthModule],
  controllers: [AppointmentMeetingsServiceController],
  providers: [AppointmentMeetingsService],
  exports: [AppointmentMeetingsService],
})

export class AppointmentMeetingsModule {}