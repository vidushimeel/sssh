import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAudioColumnsToAppointmentMeetings1682647382305
  implements MigrationInterface
{
  table = "organization_appointment_meetings";
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE ${this.table} ADD COLUMN bitrate_kbps FLOAT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE ${this.table} ADD COLUMN duration_seconds FLOAT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE ${this.table} ADD COLUMN file_format VARCHAR(255) NULL`
    );
    await queryRunner.query(
      `ALTER TABLE ${this.table} ADD COLUMN file_upload_status ENUM('success', 'failed') NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE ${this.table} DROP COLUMN file_upload_status`
    );
    await queryRunner.query(
      `ALTER TABLE ${this.table} DROP COLUMN file_format`
    );
    await queryRunner.query(
      `ALTER TABLE ${this.table} DROP COLUMN duration_seconds`
    );
    await queryRunner.query(
      `ALTER TABLE ${this.table} DROP COLUMN bitrate_kbps`
    );
  }
}
