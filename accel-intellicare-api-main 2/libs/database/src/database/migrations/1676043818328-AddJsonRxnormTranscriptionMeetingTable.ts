import { MigrationInterface, QueryRunner } from "typeorm"

export class AddJsonRxnormTranscriptionMeetingTable1676043818328 implements MigrationInterface {

    table = 'transcription_meetings';
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
        `ALTER TABLE ${this.table} ADD COLUMN rxnorm_transcription JSON DEFAULT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
        `ALTER TABLE ${this.table} DROP COLUMN rxnrom_transcription`,
        );
    }
}
