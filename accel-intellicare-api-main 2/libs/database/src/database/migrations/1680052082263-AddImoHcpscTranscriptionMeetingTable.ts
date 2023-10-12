import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImoHcpscTranscriptionMeetingTable1680052082263
  implements MigrationInterface
{
  table = "transcription_meetings";
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE ${this.table} ADD COLUMN imo_hcpsc_transcription JSON DEFAULT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE ${this.table} DROP COLUMN imo_hcpsc_transcription`
    );
  }
}
