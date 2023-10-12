import { MigrationInterface, QueryRunner } from "typeorm"

export class AddJsonTranscriptionTranscriptionMeetingTable1676006030460 implements MigrationInterface {

    table = 'transcription_meetings';
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
        `ALTER TABLE ${this.table} ADD COLUMN meeting_transcription JSON DEFAULT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
        `ALTER TABLE ${this.table} DROP COLUMN meeting_transcription`,
        );
    }
}
