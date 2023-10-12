import { MigrationInterface, QueryRunner } from "typeorm"

export class RemoveJsonMedicalTranscriptionMeetingTable1676043568406 implements MigrationInterface {

    table = 'transcription_meetings';
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
        `ALTER TABLE ${this.table} DROP COLUMN medical_transcription`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
        `ALTER TABLE ${this.table} ADD COLUMN medical_transcription JSON DEFAULT NULL`,
        );
    }

}
