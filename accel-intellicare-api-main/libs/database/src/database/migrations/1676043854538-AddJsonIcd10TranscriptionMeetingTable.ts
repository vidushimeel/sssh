import { MigrationInterface, QueryRunner } from "typeorm"

export class AddJsonIcd10TranscriptionMeetingTable1676043854538 implements MigrationInterface {

    table = 'transcription_meetings';
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
        `ALTER TABLE ${this.table} ADD COLUMN icd10_transcription JSON DEFAULT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
        `ALTER TABLE ${this.table} DROP COLUMN icd10_transcription`,
        );
    }
}
