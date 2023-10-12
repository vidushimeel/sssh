import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIMOFieldsToTranscriptionMeetingTable1679888890595
  implements MigrationInterface
{
  table = "transcription_meetings";
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE ${this.table} ADD COLUMN imo_rxnorm_transcription JSON DEFAULT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE ${this.table} ADD COLUMN imo_icd10_transcription JSON DEFAULT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE ${this.table} ADD COLUMN imo_snomed_transcription JSON DEFAULT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE ${this.table} ADD COLUMN imo_cpt_transcription JSON DEFAULT NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE ${this.table} DROP COLUMN imo_rxnorm_transcription`
    );
    await queryRunner.query(
      `ALTER TABLE ${this.table} DROP COLUMN imo_icd10_transcription`
    );
    await queryRunner.query(
      `ALTER TABLE ${this.table} DROP COLUMN imo_snomed_transcription`
    );
    await queryRunner.query(
      `ALTER TABLE ${this.table} DROP COLUMN imo_cpt_transcription`
    );
  }
}
