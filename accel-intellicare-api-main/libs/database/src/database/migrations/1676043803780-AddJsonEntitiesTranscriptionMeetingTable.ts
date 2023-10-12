import { MigrationInterface, QueryRunner } from "typeorm"

export class AddJsonEntitiesTranscriptionMeetingTable1676043803780 implements MigrationInterface {

    table = 'transcription_meetings';
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
        `ALTER TABLE ${this.table} ADD COLUMN entities_transcription JSON DEFAULT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
        `ALTER TABLE ${this.table} DROP COLUMN entities_transcription`,
        );
    }
}
