import { MigrationInterface, QueryRunner } from "typeorm"

export class RenameImoHcpscColumnTranscriptionMeeting1681359015533 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn('transcription_meetings', 'imo_hcpsc_transcription', 'imo_hcpcs_transcription');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn('transcription_meetings', 'imo_hcpcs_transcription', 'imo_hcpsc_transcription');
    }

}
