import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  Appointment,
  AppointmentMeeting,
  AppointmentMeetingDTO,
  TranscriptionMeetings,
  AppointmentDTO,
  AppointmentFullDTO,
  UserApp,
  UserAppDTO,
  Patients,
  OrganizationMembers,
  PatientDTO,
} from "@app/database/entities";
import { DatabaseService } from "@app/database";
import { MediaService } from "./media.service";
import { Crud, CrudController } from "@rewiko/crud";
import { DataSource } from "typeorm";
import AWS = require("aws-sdk");
import { JwtAuthGuard, AllowedGroups } from "@auth/auth/groups.guard";
import { RESPONSE_API } from "./messages.return";
import * as uuid from "uuid";
import { MailService } from "@app/mail";
import { transcriptionCompletedEmailTemplate } from "@app/mail/helpers/emailMessages";

const {
  AWS_API_ACCESS_KEY_ID,
  AWS_API_SECRET_ACCESS_KEY,
  AWS_API_REGION,
  AWS_S3_BUCKET,
  AWS_PIPELINE_ID,
  AWS_FORMAT_MP3,
  TWILIO_ACCOUNT_TOKEN,
  TWILIO_ACCOUNT_SID,
  APP_URL,
} = process.env;

@Crud({
  model: {
    type: AppointmentMeeting,
  },
  routes: {
    getManyBase: {
      // decorators: [AllowedGroups(['system', 'admin'])],
    },
    getOneBase: {
      // decorators: [AllowedGroups(['system', 'admin'])],
    },
    createOneBase: {
      // decorators: [AllowedGroups(['system', 'admin'])],
    },
    createManyBase: {
      // decorators: [AllowedGroups(['system', 'admin'])],
    },
    updateOneBase: {
      // decorators: [AllowedGroups(['system', 'admin'])],
    },
    replaceOneBase: {
      // decorators: [AllowedGroups(['system', 'admin'])],
    },
    deleteOneBase: {
      // decorators: [AllowedGroups(['system', 'admin'])],
    },
  },
  query: {
    alwaysPaginate: false,
    cache: 1800000,
  },
})
@UseGuards(JwtAuthGuard)
@Controller({
  path: "api",
  version: "1",
})
export class MediaController implements CrudController<AppointmentMeeting> {
  constructor(
    readonly service: MediaService,
    readonly dbService: DatabaseService,
    readonly dataSource: DataSource,
    readonly mailService: MailService
  ) {}

  get base(): CrudController<AppointmentMeeting> {
    return this;
  }

  /**
   *
   * @param request
   * @returns Promise
   */
  @AllowedGroups(["client", "admin"])
  @Post("audio-with-appointment-uuid")
  async storeAudioWithoutApointmentData(
    @Body() request: AppointmentMeetingDTO
  ): Promise<AppointmentMeeting> {
    try {
      if (
        !request.appointmentID ||
        !request.startedAt.trim() ||
        !request.endedAt.trim() ||
        !request.mp3File
      ) {
        throw new HttpException(
          RESPONSE_API.emptyFields,
          HttpStatus.BAD_REQUEST
        );
      }

      let appointmentData = await this.service.appointmentData(
        request.appointmentID
      );

      //if no exists the appointment return json message
      if (appointmentData === 0) {
        throw new HttpException(
          RESPONSE_API.appointmentNoExists,
          HttpStatus.NO_CONTENT
        );
      }

      let existsAppointmentMeeting =
        await this.service.isAppointmentMeetingExists(
          appointmentData.appointment_uuid
        );

      //if the appointment meeting already exists return json message
      if (existsAppointmentMeeting) {
        throw new HttpException(
          RESPONSE_API.meetingExists,
          HttpStatus.BAD_REQUEST
        );
      }

      let s3Upload = await this.uploadFile(
        request.mp3File,
        appointmentData.appointment_uuid
      );
      let uniqueName = s3Upload.key.replace("media/", "").replace(".mp3", "");
      let date = new Date();

      const appointmentDto: AppointmentMeeting = {
        id: null,
        appointment: appointmentData.appointment_id,
        sid: uniqueName,
        unique_name: uniqueName,
        status: "completed",
        startedAt: new Date(request.startedAt),
        endedAt: new Date(request.endedAt),
        createAt: date,
        updateAt: date,
        sid_composition: null,
        bitrate_kbps: null,
        duration_seconds: null,
        file_format: null,
        file_upload_status: null,
      };

      const createAM: AppointmentMeeting =
        await this.service.createAppointmentMeeting(appointmentDto);
      return createAM;
    } catch (error) {
      throw new HttpException(error.response, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   *
   * @param request
   * @returns Promise
   */
  @AllowedGroups(["client", "admin"])
  @Post("audio-with-appointment-data")
  async storeAudioWithApointmentData(
    @Body() request: AppointmentFullDTO
  ) /* : Promise <AppointmentMeeting>*/ {
    try {
      /*
      if(!request.appointmentID || !request.startedAt.trim() || !request.endedAt.trim() || !request.mp3File){
        throw new HttpException(
          RESPONSE_API.emptyFields,
          HttpStatus.BAD_REQUEST,
        );
      }
      */

      //1) validate if appointment visitNumber exitsts
      let appointmentExists = await this.service.appointmentData(
        request.Visit.VisitNumber
      );
      if (appointmentExists) {
        throw new HttpException(
          RESPONSE_API.appointmentVisitNumberExists,
          HttpStatus.NO_CONTENT
        );
      }

      //2) validate if NPI physician doesn't existst
      let appointmentProvider = await this.service.getProvider(
        request.Visit.AttendingProvider
      );

      if (!appointmentProvider[0]) {
        throw new HttpException(
          RESPONSE_API.appointmentProviderError,
          HttpStatus.NO_CONTENT
        );
      }

      let siteData = await this.service.existsSiteUudi(request.Visit.siteUuid);

      //if doesn't exitst the uidi site
      if (siteData == 0) {
        throw new HttpException(
          RESPONSE_API.siteDoesNotExists,
          HttpStatus.BAD_REQUEST
        );
      }

      //3) create or update user profile
      let user = await this.storeUser(request.Patients);

      //4) create or update patient
      let patient = await this.storePatient(
        request.Patients,
        user.id,
        appointmentProvider[0].id
      );

      //5 create appointment
      let uidiAppointment = uuid.v4();
      const appointmentDto: AppointmentDTO = {
        id: null,
        uuid: uidiAppointment,
        organization_id: patient.organization_id,
        patient_id: patient.id,
        last_updated_by: appointmentProvider[0].id,
        date: new Date(),
        urgency:
          request.Visit.Priority == "Normal"
            ? "medium"
            : request.Visit.Priority == "High"
            ? "high"
            : request.Visit.Priority == "Low"
            ? "low"
            : "medium",
        type: "audio",
        visit_number: request.Visit.VisitNumber,
        assigned_user_id: appointmentProvider[0].id,
        created_at: new Date(),
        updated_at: new Date(),
        site_id: siteData,
      };

      const createAppointment: Appointment =
        await this.service.createAppointment(appointmentDto);

      let s3Upload = await this.uploadFile(request.mp3File, uidiAppointment);
      let uniqueName = s3Upload.key.replace("media/", "").replace(".mp3", "");

      const appointmentMeetingDto: AppointmentMeeting = {
        id: null,
        appointment: createAppointment,
        sid: uniqueName,
        unique_name: uniqueName,
        status: "completed",
        startedAt: new Date(request.startedAt),
        endedAt: new Date(request.endedAt),
        createAt: new Date(),
        updateAt: new Date(),
        sid_composition: null,
        bitrate_kbps: null,
        duration_seconds: null,
        file_format: null,
        file_upload_status: null,
      };

      await this.service.createAppointmentMeetingTest(appointmentMeetingDto);

      return createAppointment;
    } catch (error) {
      throw new HttpException(error.response, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   *
   * @param mp3File {string} mp3 file upload by base64
   * @param uidi {string} appointment uidi
   * @returns {array} route and keyName file in bucket
   */
  @AllowedGroups(["public"])
  async uploadFile(mp3File, uidi) {
    // Configure AWS to use promise
    AWS.config.setPromisesDependency(require("bluebird"));
    AWS.config.update({
      accessKeyId: AWS_API_ACCESS_KEY_ID,
      secretAccessKey: AWS_API_SECRET_ACCESS_KEY,
      region: AWS_API_REGION,
    });

    // Create an s3 instance
    const s3 = new AWS.S3();

    // Ensure that you POST a base64 data to your server.
    const base64Data = Buffer.from(
      mp3File.replace(/^data:audio\/\w+;base64,/, ""),
      "base64"
    );

    // Getting the file type, ie: jpeg, png or gif
    const type = mp3File.split(";")[0].split("/")[1];

    const params = {
      Bucket: AWS_S3_BUCKET,
      Key: `media/${uidi}.${type}`,
      Body: base64Data,
      ContentEncoding: "base64",
      ContentType: `audio/${type}`,
    };

    let location = "";
    let key = "";

    try {
      const { Location, Key } = await s3.upload(params).promise();
      location = Location;
      key = Key;
    } catch (error) {
      return error;
    }

    return { location, key };
  }

  /**
   *
   * @param filename {string} filename sent by API
   * @returns Promise
   */
  @AllowedGroups(["public"])
  @Get("start-transcription-media/:filename")
  async generateTranscriptionFile(
    @Param("filename") filename: string
  ): Promise<TranscriptionMeetings> {
    // Configure AWS to use promise
    AWS.config.setPromisesDependency(require("bluebird"));
    AWS.config.update({
      accessKeyId: AWS_API_ACCESS_KEY_ID,
      secretAccessKey: AWS_API_SECRET_ACCESS_KEY,
      region: AWS_API_REGION,
    });

    const s3 = new AWS.S3();
    const transcoder = new AWS.TranscribeService();

    let partsFilename = filename.split(".");

    let paramsBucket = {
      Bucket: AWS_S3_BUCKET,
      Key: "media/" + filename,
    };

    try {
      await s3.headObject(paramsBucket).promise();

      const mp3Object = await s3.getObject(paramsBucket).promise();
      await this.service.updateAppointmentMeetingAudioData(
        mp3Object,
        partsFilename[0]
      );

      let paramsTranscoder = {
        //TranscriptionJobName: partsFilename[0],
        MedicalTranscriptionJobName: partsFilename[0],
        LanguageCode: "en-US",
        MediaFormat: filename.indexOf("wav") !== -1 ? "wav" : "mp3",
        Media: {
          MediaFileUri:
            "https://" +
            AWS_S3_BUCKET +
            ".s3.us-east-1.amazonaws.com/media/" +
            filename,
        },
        OutputBucketName: AWS_S3_BUCKET,
        OutputKey: "transcriptions/",
        Settings: {
          MaxAlternatives: 2,
          MaxSpeakerLabels: 2,
          ShowAlternatives: true,
          ShowSpeakerLabels: true,
        },
        Specialty: "PRIMARYCARE",
        Type: "CONVERSATION",
      };

      let transcriptionProccess = await transcoder
        //.startTranscriptionJob(paramsTranscoder)
        .startMedicalTranscriptionJob(paramsTranscoder)
        .promise();

      if (
        transcriptionProccess &&
        transcriptionProccess.MedicalTranscriptionJob
      ) {
        /*transcriptionProccess.TranscriptionJob*/
        let date = new Date();

        const transcriptionMeetingDTO: TranscriptionMeetings = {
          id: null,
          unique_name:
            transcriptionProccess.MedicalTranscriptionJob
              .MedicalTranscriptionJobName, //transcriptionProccess.TranscriptionJob.TranscriptionJobName
          sid_mka:
            transcriptionProccess.MedicalTranscriptionJob
              .MedicalTranscriptionJobName, //transcriptionProccess.TranscriptionJob.TranscriptionJobName
          job_id:
            "JOB_" +
            transcriptionProccess.MedicalTranscriptionJob
              .MedicalTranscriptionJobName, //transcriptionProccess.TranscriptionJob.TranscriptionJobName
          job_status:
            transcriptionProccess.MedicalTranscriptionJob
              .TranscriptionJobStatus,
          created_at: date,
          updated_at: date,
          accountSid: null,
          room_sid: null,
          participant_sid: null,
          job_transcription: null,
          meeting_transcription: null,
          entities_transcription: null,
          rxnorm_transcription: null,
          icd10_transcription: null,
          snomed_transcription: null,
          appointment: null,
          cpt_transcription: null,
          imo_rxnorm_transcription: null,
          imo_icd10_transcription: null,
          imo_snomed_transcription: null,
          imo_cpt_transcription: null,
          imo_hcpcs_transcription: null,
        };

        return await this.service.createTranscriptionMeeting(
          transcriptionMeetingDTO
        );
      }
    } catch (error) {
      return error;
    }
  }

  /**
   *
   * @param filename {string} filename sent by API
   * @returns Promise
   */
  @AllowedGroups(["public"])
  @Get("store-transcription-media/:filename")
  async storeTranscriptionFile(
    @Param("filename") filename: string
  ): Promise<TranscriptionMeetings> {
    // Configure AWS to use promise
    AWS.config.setPromisesDependency(require("bluebird"));
    AWS.config.update({
      accessKeyId: AWS_API_ACCESS_KEY_ID,
      secretAccessKey: AWS_API_SECRET_ACCESS_KEY,
      region: AWS_API_REGION,
    });

    const s3 = new AWS.S3();
    const transcoder = new AWS.TranscribeService();
    const medicalTrans = new AWS.ComprehendMedical();

    let partsFilename = filename.split(".");

    let paramsBucket = {
      Bucket: AWS_S3_BUCKET,
      Key: "transcriptions/medical/" + filename,
    };

    let entities,
      rxnorm,
      icd10,
      snomed,
      imoRxnorm,
      imoIcd10,
      imoSnomed,
      imoHcpcs,
      imoCpt = {};
    try {
      const objJsonTranscription = await s3.getObject(paramsBucket).promise();
      const objTransJobStatus = await transcoder
        //.getTranscriptionJob({ TranscriptionJobName: partsFilename[0] })
        .getMedicalTranscriptionJob({
          MedicalTranscriptionJobName: partsFilename[0],
        })
        .promise();

      if (
        objTransJobStatus &&
        objTransJobStatus.MedicalTranscriptionJob && //objTransJobStatus.TranscriptionJob &&
        objTransJobStatus.MedicalTranscriptionJob.TranscriptionJobStatus ===
          "COMPLETED" //objTransJobStatus.TranscriptionJob.TranscriptionJobStatus ===
      ) {
        var objJsonTrans = objJsonTranscription.Body.toString("utf-8");
        var txtmMedical: string =
          JSON.parse(objJsonTrans)["results"]["transcripts"][0]["transcript"];

        if (txtmMedical != "") {
          //first step, count charts of transcription
          const cantCharts = txtmMedical.toString().length;
          console.log("ChartsCount: ", cantCharts);

          //detectEntitiesV2
          if (cantCharts <= 19000) {
            entities = await medicalTrans
              .detectEntitiesV2({ Text: txtmMedical })
              .promise();
          } else {
            let dataArrayEntities: any;
            let strEntities = txtmMedical.match(/.{1,19000}/g);
            console.log("LenghText ENTITIES: ", strEntities.length);
            for (let i = 0; i < strEntities.length; i++) {
              let resultEntities = await medicalTrans
                .detectEntitiesV2({ Text: strEntities[i] })
                .promise();

              if (i == 0) {
                dataArrayEntities = resultEntities;
              } else {
                if (
                  dataArrayEntities &&
                  dataArrayEntities["Entities"] &&
                  dataArrayEntities["Entities"].length > 0
                ) {
                  if (
                    resultEntities &&
                    resultEntities["Entities"] &&
                    resultEntities["Entities"].length > 0
                  ) {
                    for (
                      let i = 0;
                      i < resultEntities["Entities"].length;
                      i++
                    ) {
                      dataArrayEntities["Entities"].push(
                        resultEntities["Entities"][i]
                      );
                    }
                  }
                }
              }
            }
            entities = dataArrayEntities;
          }

          //inferRxNorm & inferICD10CM
          if (cantCharts <= 9000) {
            rxnorm = await medicalTrans
              .inferRxNorm({ Text: txtmMedical })
              .promise();
            icd10 = await medicalTrans
              .inferICD10CM({ Text: txtmMedical })
              .promise();
          } else {
            let dataArrayRX: any;
            let dataArrayIC: any;
            let strRXIC = txtmMedical.match(/.{1,9000}/g);
            console.log("LenghText RXNORM - ICD10CM: ", strRXIC.length);
            for (let i = 0; i < strRXIC.length; i++) {
              let resultRx = await medicalTrans
                .inferRxNorm({ Text: strRXIC[i] })
                .promise();

              if (i == 0) {
                dataArrayRX = resultRx;
              } else {
                if (
                  dataArrayRX &&
                  dataArrayRX["Entities"] &&
                  dataArrayRX["Entities"].length > 0
                ) {
                  if (
                    resultRx &&
                    resultRx["Entities"] &&
                    resultRx["Entities"].length > 0
                  ) {
                    for (let i = 0; i < resultRx["Entities"].length; i++) {
                      dataArrayRX["Entities"].push(resultRx["Entities"][i]);
                    }
                  }
                }
              }

              let resultIC = await medicalTrans
                .inferICD10CM({ Text: strRXIC[i] })
                .promise();

              if (i == 0) {
                dataArrayIC = resultIC;
              } else {
                if (
                  dataArrayIC &&
                  dataArrayIC["Entities"] &&
                  dataArrayIC["Entities"].length > 0
                ) {
                  if (
                    resultIC &&
                    resultIC["Entities"] &&
                    resultIC["Entities"].length > 0
                  ) {
                    for (let i = 0; i < resultIC["Entities"].length; i++) {
                      dataArrayIC["Entities"].push(resultIC["Entities"][i]);
                    }
                  }
                }
              }
            }
            icd10 = dataArrayIC;
            rxnorm = dataArrayRX;
          }

          //inferSNOMEDCT
          if (cantCharts <= 4000) {
            snomed = await medicalTrans
              .inferSNOMEDCT({ Text: txtmMedical })
              .promise();
          } else {
            let dataArraySnomed: any;
            let strSnomed = txtmMedical.match(/.{1,4000}/g);
            console.log("LenghText SMOMED: ", strSnomed.length);
            for (let i = 0; i < strSnomed.length; i++) {
              let resultSnomed = await medicalTrans
                .inferSNOMEDCT({ Text: strSnomed[i] })
                .promise();

              if (i == 0) {
                dataArraySnomed = resultSnomed;
              } else {
                if (
                  dataArraySnomed &&
                  dataArraySnomed["Entities"] &&
                  dataArraySnomed["Entities"].length > 0
                ) {
                  if (
                    resultSnomed &&
                    resultSnomed["Entities"] &&
                    resultSnomed["Entities"].length > 0
                  ) {
                    for (let i = 0; i < resultSnomed["Entities"].length; i++) {
                      dataArraySnomed["Entities"].push(
                        resultSnomed["Entities"][i]
                      );
                    }
                  }
                }
              }
            }
            snomed = dataArraySnomed;
          }

          // const imoResults = await this.service.getImoResults(
          //   entities.Entities
          // );
          // imoRxnorm = imoResults.imoRxnorm;
          // imoIcd10 = imoResults.imoIcd10;
          // imoSnomed = imoResults.imoSnomed;
          // imoCpt = imoResults.imoCpt;

          imoHcpcs = await this.service.getHcpcsCodes(entities.Entities);
          imoCpt = await this.service.getCptCodes(entities.Entities);
        }

        return this.updateTranscription(
          //objTransJobStatus.TranscriptionJob.TranscriptionJobName,
          objTransJobStatus.MedicalTranscriptionJob.MedicalTranscriptionJobName,
          objTransJobStatus,
          objJsonTrans,
          entities,
          rxnorm,
          icd10,
          snomed,
          imoRxnorm,
          imoIcd10,
          imoSnomed,
          imoCpt,
          imoHcpcs
        );
      }
    } catch (error) {
      return error;
    }
  }

  /**
   *
   * @param uniqueName {string} name to find file
   * @param jobJson {JSON} object with the json job transcription
   * @param transcriptionJson {JSON} object with the json meeting transcription
   * @param medicalJson {JSON} object with the json medical transcription
   * @returns Promise
   */
  @AllowedGroups(["public"])
  async updateTranscription(
    uniqueName,
    jobJson,
    transcriptionJson,
    entitiesJson,
    rxnormJson,
    icd10Json,
    snomedJson,
    imoRxnormJson,
    imoIcd10Json,
    imoSnomedJson,
    imoCptJson,
    imoHcpcsJson
  ): Promise<TranscriptionMeetings> {
    try {
      const oldTM: TranscriptionMeetings =
        await this.service.findTranscriptionMeeting(uniqueName);

      oldTM.job_transcription = jobJson;
      oldTM.meeting_transcription = JSON.parse(transcriptionJson);
      oldTM.entities_transcription = entitiesJson;
      oldTM.rxnorm_transcription = rxnormJson;
      oldTM.icd10_transcription = icd10Json;
      oldTM.snomed_transcription = snomedJson;
      oldTM.imo_rxnorm_transcription = imoRxnormJson;
      oldTM.imo_icd10_transcription = imoIcd10Json;
      oldTM.imo_snomed_transcription = imoSnomedJson;
      oldTM.imo_cpt_transcription = imoCptJson;
      oldTM.imo_hcpcs_transcription = imoHcpcsJson;
      oldTM.job_status = "COMPLETED";

      const transcriptionMeeting =
        await this.service.updateTranscriptionMeeting(oldTM);
      if (transcriptionMeeting.job_status === "COMPLETED") {
        await this.sendTranscriptionMailNotification(uniqueName);
      }
      return transcriptionMeeting;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async sendTranscriptionMailNotification(uniqueName: string) {
    try {
      const appointmentMeeting =
        await this.service.getAppointmentMeetingByUniqueName(uniqueName);
      if (!appointmentMeeting) {
        throw new Error("Appointment meeting not found");
      }
      const appointmentData = await this.service.getAppointmentById(
        appointmentMeeting.oam_organization_appointment_id
      );
      const receptorEmail = appointmentData.assigned_user_email;
      const subject = `Transcription ${appointmentData.appointment_id} Completed`;
      const appointmentUrl = `${APP_URL}organizations/${appointmentData.appointment_organization_id}/appointments/${appointmentData.appointment_id}`;
      const message = `
      <p>
        The Transcription ID ${appointmentData.appointment_id} is completed
      </p>
      <p>
        Date: ${new Date().toLocaleString()}
      </p>
      <p>
        Patient: ${appointmentData.patient_user_name} ${
        appointmentData.patient_user_last_name
      }
      </p>
      <p>
        Provider: ${appointmentData.assigned_user_name}
      </p>
      `;
      const html = transcriptionCompletedEmailTemplate(appointmentUrl, message);
      await this.mailService.sendEmailAsSESIdentity(
        [receptorEmail],
        html,
        message,
        subject
      );
    } catch (error) {
      console.error("SEND NOTIFICATION MAIL ERROR: ", error);
      throw new Error("Error sending mail notification");
    }
  }

  /**
   *
   * @param request
   * @returns Promise
   */
  @AllowedGroups(["client", "admin"])
  @Post("audio-create-test")
  async storeAudioAppointmentTest(@Body() request) {
    try {
      let appointmentData = await this.service.getAppointmentById(
        request.appointmentID
      );

      //if exists the appointment return json message
      if (appointmentData != 0) {
        throw new HttpException(
          RESPONSE_API.appointmentExists,
          HttpStatus.BAD_REQUEST
        );
      }

      let siteData = await this.service.existsSiteUudi(request.siteUuid);

      //if doesn't exitst the uidi site
      if (siteData == 0) {
        throw new HttpException(
          RESPONSE_API.siteDoesNotExists,
          HttpStatus.BAD_REQUEST
        );
      }

      let date = new Date();

      const appointmentDto: AppointmentDTO = {
        id: null,
        uuid: request.appointmentID,
        organization_id: 1,
        patient_id: 33,
        last_updated_by: 3,
        date: new Date(),
        urgency: "high",
        type: "audio",
        visit_number: request.appointmentID,
        assigned_user_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        site_id: siteData,
      };

      const createAppointment: Appointment =
        await this.service.createAppointment(appointmentDto);

      let s3Upload = await this.uploadFile(
        request.mp3File,
        request.appointmentID
      );
      let uniqueName = s3Upload.key.replace("media/", "").replace(".mp3", "");

      const appointmentMeetingDto: AppointmentMeeting = {
        id: null,
        appointment: createAppointment,
        sid: uniqueName,
        unique_name: uniqueName,
        status: "completed",
        startedAt: new Date(),
        endedAt: new Date(),
        createAt: date,
        updateAt: date,
        sid_composition: null,
        bitrate_kbps: null,
        duration_seconds: null,
        file_format: null,
        file_upload_status: null,
      };

      await this.service.createAppointmentMeetingTest(appointmentMeetingDto);

      return createAppointment;
    } catch (error) {
      throw new HttpException(error.response, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   *
   * @param data Patients data for user creation
   * @returns Promise
   */
  @AllowedGroups(["public"])
  async storeUser(data): Promise<UserApp> {
    let demographics = data.Demographics;
    const oldUser: UserApp = await this.service.findUser(
      demographics.EmailAddress
    );

    if (oldUser) {
      oldUser.name = demographics.FirstName + " " + demographics.MiddleName;
      oldUser.last_name = demographics.LastName;
      oldUser.email = demographics.EmailAddress;
      oldUser.password =
        "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";
      oldUser.address1 = demographics.Address.StreetAddress;
      oldUser.city = demographics.Address.City;
      oldUser.phone1 = demographics.PhoneNumber.Home;
      oldUser.phone2 = demographics.PhoneNumber.Mobile;
      oldUser.date_of_birth = demographics.DOB;
      oldUser.gender = demographics.Sex.toLowerCase();
      oldUser.identifiers = data.Identifiers;
      oldUser.updated_at = new Date();

      return await this.service.storeUser(oldUser);
    } else {
      const userDto: UserAppDTO = {
        id: null,
        name: demographics.FirstName + " " + demographics.MiddleName,
        last_name: demographics.LastName,
        email: demographics.EmailAddress,
        password:
          "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
        address1: demographics.Address.StreetAddress,
        city: demographics.Address.City,
        phone1: demographics.PhoneNumber.Home,
        phone2: demographics.PhoneNumber.Mobile,
        date_of_birth: demographics.DOB,
        gender: demographics.Sex.toLowerCase(),
        identifiers: demographics.Identifiers,
        created_at: new Date(),
        updated_at: new Date(),
      };
      return await this.service.storeUser(userDto);
    }
  }

  /**
   *
   * @param data Patients data for patient creation
   * @returns Promise
   */
  @AllowedGroups(["public"])
  async storePatient(data, userID, providerID): Promise<any> {
    let demographics = data.Demographics;
    const oldPatient: Patients = await this.service.findPatient(userID);
    const organizationMemberData: OrganizationMembers =
      await this.service.findOrganizationMember(providerID);

    let numberSSN = demographics.SSN;
    numberSSN = numberSSN.split("-");

    if (oldPatient) {
      oldPatient.organization_id = organizationMemberData
        ? organizationMemberData.organization_id
        : 1;
      oldPatient.social_security_number =
        numberSSN && numberSSN.length > 0
          ? numberSSN[numberSSN.length - 1]
          : "0000";
      oldPatient.user_id = userID;
      oldPatient.primary_provider = organizationMemberData.id;
      oldPatient.created_by = providerID;
      oldPatient.last_updated_by = providerID;
      oldPatient.updated_at = new Date();

      return await this.service.storePatient(oldPatient);
    } else {
      const patientDto: PatientDTO = {
        id: null,
        uuid: uuid.v4(),
        organization_id: organizationMemberData
          ? organizationMemberData.organization_id
          : 1,
        social_security_number:
          numberSSN && numberSSN.length > 0
            ? numberSSN[numberSSN.length - 1]
            : "0000",
        user_id: userID,
        primary_provider: organizationMemberData.id,
        created_by: providerID,
        last_updated_by: providerID,
        created_at: new Date(),
        updated_at: new Date(),
      };

      return await this.service.storePatient(patientDto);
    }
  }

  /**
   * @param filename {String}
   */
  @AllowedGroups(["public"])
  @Get("convert-media-file/:filename")
  async convertMp4File(@Param("filename") filename: string) {
    // Configure AWS to use promise
    AWS.config.setPromisesDependency(require("bluebird"));
    AWS.config.update({
      accessKeyId: AWS_API_ACCESS_KEY_ID,
      secretAccessKey: AWS_API_SECRET_ACCESS_KEY,
      region: AWS_API_REGION,
    });

    const transcoder = new AWS.ElasticTranscoder();

    let partsFilename = filename.split(".");

    try {
      let appointmentMeeting = await this.service.appointmentMeetingSid(
        partsFilename[0]
      );

      //if the appointment meeting doesn't exists return json message
      if (!appointmentMeeting) {
        throw new HttpException(
          RESPONSE_API.meetingDoesNotExists,
          HttpStatus.BAD_REQUEST
        );
      }

      const paramsTranscoder = {
        PipelineId: AWS_PIPELINE_ID,
        Input: { Key: "compositions/" + filename },
        Outputs: [
          {
            Key:
              "media/" +
              appointmentMeeting.organization_appointment_meetings_sid +
              ".mp3",
            PresetId: AWS_FORMAT_MP3,
          },
        ],
      };

      return await transcoder.createJob(paramsTranscoder).promise();
    } catch (error) {
      return error;
    }
  }
}
