import { MigrationInterface, QueryRunner } from "typeorm"

export class AddSiteIdToAppointments1681830950489 implements MigrationInterface {

    table = "organization_appointments";
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE ${this.table} ADD COLUMN site_id INTEGER DEFAULT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE ${this.table} DROP COLUMN site_id`
        );
    }
}
