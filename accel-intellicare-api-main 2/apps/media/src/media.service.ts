import {
  AppointmentMeeting,
  Appointment,
  TranscriptionMeetings,
  AppointmentDTO,
  Patients,
  UserApp,
  OrganizationMembers,
  UserAppDTO,
  Sites,
} from "@app/database/entities";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@rewiko/crud-typeorm";
import { DataSource, FindOneOptions, JsonContains } from "typeorm";
import { getImoPrecisionNormalize } from "../../../libs/managers/IMOIntegration";
import * as uuid from "uuid";
import mp3Duration from "mp3-duration";
import { GetObjectOutput } from "aws-sdk/clients/s3";

@Injectable()
export class MediaService extends TypeOrmCrudService<AppointmentMeeting> {
  constructor(
    @InjectRepository(AppointmentMeeting) repo,
    readonly dataSource: DataSource
  ) {
    super(repo);
  }

  async appointmentData(visit_number: string | number): Promise<any> {
    const appointment = await this.dataSource
      .getRepository(Appointment)
      .createQueryBuilder("appointment")
      .where("appointment.visit_number = :visit_number", { visit_number })
      .getRawOne();

    return appointment ? appointment : 0;
  }

  async isAppointmentMeetingExists(uuid: any): Promise<boolean> {
    const validate = await this.repo
      .createQueryBuilder("appointment_meetings")
      .innerJoin(
        "organization_appointments",
        "oa",
        "appointment_meetings.organization_appointment_id = oa.id"
      )
      .where("oa.uuid = :uuid", { uuid })
      .getExists();

    return validate;
  }

  async appointmentMeetingSid(sid: string): Promise<any> {
    const appointment = await this.dataSource
      .getRepository(AppointmentMeeting)
      .createQueryBuilder("organization_appointment_meetings")
      /*
      .innerJoin(
        "organization_appointment_meetings",
        "oam",
        "oam.organization_appointment_id = organization_appointments.id"
      )
      */
      .where("organization_appointment_meetings.sid_composition = :sid", {
        sid,
      })
      .getRawOne();

    return appointment ? appointment : 0;
  }

  async createAppointmentMeeting(
    createAppointmentDto: AppointmentMeeting
  ): Promise<AppointmentMeeting> {
    return this.repo.save(createAppointmentDto);
  }

  async createTranscriptionMeeting(
    createTMDto: TranscriptionMeetings
  ): Promise<TranscriptionMeetings> {
    return await this.dataSource
      .getRepository(TranscriptionMeetings)
      .save(createTMDto);
  }

  async findTranscriptionMeeting(
    unique_name: string
  ): Promise<TranscriptionMeetings> {
    return await this.dataSource
      .getRepository(TranscriptionMeetings)
      .createQueryBuilder("transcriptionMeeting")
      .where("unique_name = :unique_name", { unique_name })
      .getOne();
  }

  async updateTranscriptionMeeting(
    transcriptionMeetUpdated: any
  ): Promise<TranscriptionMeetings> {
    return await this.dataSource
      .getRepository(TranscriptionMeetings)
      .save(transcriptionMeetUpdated);
  }

  async getProvider(identifiersFilter: {
    IDType: any;
    ID: any;
  }): Promise<UserAppDTO> {
    return await this.dataSource
      .getRepository(UserApp)
      .query(
        `SELECT * FROM users UserApp WHERE json_contains(identifiers, '{"IDType" : "` +
          identifiersFilter.IDType +
          `"}') AND json_contains(identifiers, '{"ID": "` +
          identifiersFilter.ID +
          `"}')`
      );
  }

  async findUser(email: string): Promise<any> {
    const userData = await this.dataSource
      .getRepository(UserApp)
      .createQueryBuilder()
      .where("email = :email", { email })
      .getOne();

    return userData ? userData : 0;
  }

  async storeUser(userData: any): Promise<UserApp> {
    return await this.dataSource.getRepository(UserApp).save(userData);
  }

  async findPatient(user_id: number): Promise<any> {
    const patientData = await this.dataSource
      .getRepository(Patients)
      .createQueryBuilder()
      .where("user_id = :user_id", { user_id })
      .getOne();

    return patientData ? patientData : 0;
  }

  async findOrganizationMember(user_id: number): Promise<any> {
    const memberData = await this.dataSource
      .getRepository(OrganizationMembers)
      .createQueryBuilder()
      .where("user_id = :user_id", { user_id })
      .getOne();

    return memberData ? memberData : 0;
  }

  async storePatient(patientData: any): Promise<Patients> {
    return await this.dataSource.getRepository(Patients).save(patientData);
  }


  async getAppointmentMeetingByUniqueName(uniqueName: string): Promise<any> {
    return await this.dataSource
      .getRepository(AppointmentMeeting)
      .createQueryBuilder("oam")
      .where("oam.unique_name = :uniqueName", { uniqueName })
      .getRawOne();
  }


  async getAppointmentById(id: any): Promise<any> {
    const appointment = await this.dataSource
      .getRepository(Appointment)
      .createQueryBuilder("appointment")
      .leftJoinAndSelect("appointment.userApp", "assigned_user")
      .leftJoinAndSelect("appointment.patient", "patient")
      .leftJoinAndSelect(UserApp, "patient_user", "patient.user_id = patient_user.id")
      .where("appointment.id = :id", { id })
      .getRawOne();

    return appointment ? appointment : 0;
  }

  async createAppointment(
    createAppointmentDto: AppointmentDTO
  ): Promise<Appointment> {
    return await this.dataSource
      .getRepository(Appointment)
      .save(createAppointmentDto);
  }

  async createAppointmentMeetingTest(
    createAppointmentDto: AppointmentMeeting
  ): Promise<AppointmentMeeting> {
    return this.repo.save(createAppointmentDto);
  }

  async updateAppointmentMeetingAudioData(
    mp3S3Object: GetObjectOutput,
    filename: string
  ) {
    const findOneOptions: FindOneOptions<AppointmentMeeting> = {
      where: {
        unique_name: filename,
      },
    };
    const meeting = await this.repo.findOne(findOneOptions);
    const mp3Buffer = mp3S3Object.Body as Buffer;
    return new Promise<AppointmentMeeting>((resolve, reject) => {
      mp3Duration(mp3Buffer, async (err: Error | null, duration: number) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          const fileSize = mp3Buffer.length;
          // Bitrate per second
          const bitrate = Math.round((fileSize * 8) / duration / 1000);
          const fileFormatSplit = mp3S3Object.ContentType.split("/");
          meeting.duration_seconds = duration;
          meeting.file_upload_status = "success";
          meeting.file_format = fileFormatSplit[1];
          meeting.bitrate_kbps = bitrate;
          const updatedMeeting = await this.repo.save(meeting);
          resolve(updatedMeeting);
        }
      });
    });
  }

  async getImoResults(comprehendMedicalEntities: any[]) {
    try {
      // Remove duplicated entity Texts
      const cleanedEntities = [
        ...new Set(comprehendMedicalEntities.map((entity) => entity.Text)),
      ];
      return await getImoPrecisionNormalize(cleanedEntities);
    } catch (error) {
      console.log("getImoResults ERROR: ", error);
      throw new Error(error);
    }
  }

  async existsSiteUudi(uuid: number): Promise<any> {
    const site = await this.dataSource
      .getRepository(Sites)
      .createQueryBuilder("sites")
      .where("sites.uuid = :uuid", { uuid })
      .getRawOne();

    return site ? site : 0;
  }

  async getHcpcsCodes(entities: any[]) {
    const hcpcsCodes = [];
    try {
      let cleanedEntities = entities
        .filter((entity) => entity.Category !== "PROTECTED_HEALTH_INFORMATION")
        .map((entity) => entity.Text);

      cleanedEntities = [...new Set(cleanedEntities)];

      for (const entity of cleanedEntities) {
        const data = await this.dataSource.query(
          `SELECT * FROM HCPCS23tab WHERE Short_Desc LIKE '%${entity}%' OR Full_Desc  LIKE'%${entity}%'`
        );
        if (data.length > 0) {
          hcpcsCodes.push({
            codes: data.map((item: { Code: string; Full_Desc: string }) => ({
              code: item.Code,
              title: item.Full_Desc,
              map_type: "",
            })),
            score: "",
            domain: entity,
            input_term: "",
          });
        }
      }
    } catch (error) {
      console.error(":", error);
    }
    return hcpcsCodes;
  }

  async getCptCodes(entities: any[]) {
    const cptCodes = [];
    try {
      let cleanedEntities = entities
        .filter((entity) => entity.Category !== "PROTECTED_HEALTH_INFORMATION")
        .map((entity) => entity.Text);

      cleanedEntities = [...new Set(cleanedEntities)];

      for (const entity of cleanedEntities) {
        const cptEmergencyData = await this.dataSource.query(
          `SELECT * FROM cpt_emergency_release_covid_related_code_file WHERE Short_Descriptor LIKE '%${entity}%' OR Medium_Descriptor LIKE '%${entity}%'`
        );
        const longultData = await this.dataSource.query(
          `SELECT * FROM LONGULT WHERE Description LIKE '%${entity}%'`
        );
        const orthopoxvirusData = await this.dataSource.query(
          `SELECT * FROM OrthopoxvirusCodes WHERE Desc_first LIKE '%${entity}%' OR Long_desc LIKE '%${entity}%'`
        );
        if (cptEmergencyData.length > 0) {
          cptCodes.push({
            codes: cptEmergencyData.map(
              (item: { Long_Descriptor: string; Code: string }) => ({
                code: item.Code,
                title: item.Long_Descriptor,
                map_type: "",
              })
            ),
            score: "",
            domain: entity,
            input_term: "",
          });
        }
        if (longultData.length > 0) {
          cptCodes.push({
            codes: longultData.map(
              (item: { Description: string; Code: string }) => ({
                code: item.Code,
                title: item.Description,
                map_type: "",
              })
            ),
            score: "",
            domain: entity,
            input_term: "",
          });
        }
        if (orthopoxvirusData.length > 0) {
          cptCodes.push({
            codes: orthopoxvirusData.map(
              (item: { Long_desc: string; Code: string }) => ({
                code: item.Code,
                title: item.Long_desc,
                map_type: "",
              })
            ),
            score: "",
            domain: entity,
            input_term: "",
          });
        }
      }
    } catch (error) {
      console.error(":", error);
    }
    return cptCodes;
  }
}
