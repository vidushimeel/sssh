import { MigrationInterface, QueryRunner } from "typeorm"

export class AddJsonSnomedTranscriptionMeetingTable1676043871732 implements MigrationInterface {

    table = 'transcription_meetings';
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
        `ALTER TABLE ${this.table} ADD COLUMN snomed_transcription JSON DEFAULT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
        `ALTER TABLE ${this.table} DROP COLUMN snomed_transcription`,
        );
    }
}
