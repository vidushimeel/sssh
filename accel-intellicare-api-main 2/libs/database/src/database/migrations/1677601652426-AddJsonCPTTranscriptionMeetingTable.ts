import { MigrationInterface, QueryRunner } from "typeorm"

export class AddJsonCPTTranscriptionMeetingTable1677601652426 implements MigrationInterface {

    table = 'transcription_meetings';
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
        `ALTER TABLE ${this.table} ADD COLUMN cpt_transcription JSON DEFAULT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
        `ALTER TABLE ${this.table} DROP COLUMN cpt_transcription`,
        );
    }

}
