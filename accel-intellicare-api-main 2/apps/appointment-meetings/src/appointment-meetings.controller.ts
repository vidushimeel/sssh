import { Controller, Get, HttpException, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { AppointmentMeeting, Appointment, TranscriptionMeetings } from '@app/database/entities';
import { DatabaseService } from '@app/database';
import { AppointmentMeetingsService } from './appointment-meetings.service';
import { Crud, CrudController } from '@rewiko/crud';
import { JwtAuthGuard, AllowedGroups } from '@auth/auth/groups.guard';
import { DataSource } from 'typeorm';
import { ApiResponse, ApiOkResponse, ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Endpoints for Visits')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'api',
  version: '1',
})

export class AppointmentMeetingsServiceController implements CrudController<AppointmentMeeting>
{
  constructor(
    readonly service: AppointmentMeetingsService,
    readonly dbService: DatabaseService,
    readonly dataSource: DataSource,
  ) {}

  get base(): CrudController<AppointmentMeeting> {
    return this;
  }

  @AllowedGroups(['client','admin'])
  @Get('filters')
  @ApiOkResponse({ description: 'The resources were returned successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiResponse({ status: 404, description: 'Error.'})

  async findAll(@Query('uid') uid: string, @Query('start') start: string, @Query('end') end: string) {

    const appointmentMeet = await this.dataSource.getRepository(AppointmentMeeting)
      .createQueryBuilder('appointmentMeet')
      .select([
        'appointment.uuid AS patientID', 
        'appointment.visit_number AS visitNumber', 
        'appointmentMeet.started_at AS startedAt', 
        'appointmentMeet.ended_at AS endedAt', 
        'u.identifiers AS provider', 

      ])
      .innerJoin('organization_appointments', 'appointment', 'appointmentMeet.organization_appointment_id = appointment.id')
      .innerJoin('users', 'u', 'appointment.assigned_user_id = u.id')
      .where("appointment.uuid= :uid", { uid: uid })
      .andWhere("appointmentMeet.started_at <= :start", { start: start })
      .andWhere("appointmentMeet.ended_at >= :end", { end: end })
      .getRawMany();

    return appointmentMeet;
  }

  /**
   * 
   * @param visit_number {number} filter by visit_number from organization_appointments
   * @returns {Promise} Information from tables organization_appointments, organization_appointments_meetings, soap and transcription_meeting
  */
  @AllowedGroups(['client','admin'])
  @Get(':uuid')
  async findOne(@Param('uuid') uuid) : Promise<AppointmentMeeting> {
    try{
      const resultData = await this.service.appointmentDetail(uuid);
      if(!resultData){
        throw new HttpException(
          'No results were found with the parameter sent',
          HttpStatus.NO_CONTENT,
        );
      }
      return resultData;

    } catch (error) {
      throw new HttpException(error.response, HttpStatus.BAD_REQUEST);
    }
  }
}

