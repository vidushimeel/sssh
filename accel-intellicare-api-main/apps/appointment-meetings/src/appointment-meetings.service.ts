import { AppointmentMeeting } from '@app/database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@rewiko/crud-typeorm';

@Injectable()
export class AppointmentMeetingsService extends TypeOrmCrudService<AppointmentMeeting> {
  constructor(@InjectRepository(AppointmentMeeting) repo) {
    super(repo);
  }

  async appointmentDetail(uuid: any) : Promise<AppointmentMeeting>{
    
    const appointmentMeet : AppointmentMeeting = await this.repo
      .createQueryBuilder('appointmentMeet')
      .select([
        'appointment.uuid as intellicareVisitID',
        'appointment.patient_id as patientID', 
        'provider.identifiers as providerID',
        'appointment.visit_number as ehrVisitID',
        'appointment.site_id as siteID',
        'appointmentMeet.startedAt as timeFrameStartedAt',
        'appointmentMeet.endedAt as timeFrameEndedAt',
        'transcription_meet.meeting_transcription as visitTranscription',
        'transcription_meet.rxnorm_transcription as rxNormCodes',
        'transcription_meet.icd10_transcription as icd10Codes',
        'transcription_meet.snomed_transcription as snomedCodes',
        'transcription_meet.entities_transcription as entitiesCodes',
        'soap.subjective as subjectiveNotes',
        'soap.objective as objectiveNotes',
        'soap.assessment as assesmentNotes',
        'soap.plan as planNotes',
      ])
      .innerJoin('organization_appointments', 'appointment', 'appointmentMeet.organization_appointment_id = appointment.id')
      .innerJoin('users', 'provider', 'appointment.assigned_user_id = provider.id')
      .leftJoin('transcription_meetings', 'transcription_meet', 'appointment.uuid = transcription_meet.unique_name')
      .leftJoin('soap', 'soap', 'appointmentMeet.unique_name = soap.unique_name')
      .where('appointment.uuid = :uuid', { uuid })
      .getRawOne();

    return appointmentMeet;
  }
}
