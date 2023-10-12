import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBoatsTable1642897346065 implements MigrationInterface {
  db = process.env.DB_DATABASE;
  table = 'BOAT';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`${this.db}\`.\`${this.table}\` (
            \`id\` INT NOT NULL AUTO_INCREMENT,
            \`name\` VARCHAR(200) NOT NULL,
            \`make\` VARCHAR(200) NOT NULL,
            \`length_in_feet\` INT NOT NULL,
            \`created_at\` DATE NOT NULL,
            \`created_by_id\` VARCHAR(300) NOT NULL,
            \`updated_at\` DATE NULL,
            \`modified_by_id\` VARCHAR(300) NULL,
            PRIMARY KEY (\`id\`)
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`${this.db}\`.\`${this.table}\``);
  }
}
