import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTypesAndValuesDefinitions1667174028176
  implements MigrationInterface
{
  db = process.env.DB_DATABASE;
  typesTable = 'DEFINITION_TYPES';
  valuesTable = 'VALUES_DEFINITIONS';
  public async up(queryRunner: QueryRunner): Promise<void> {
    /* Definition table */
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS  \`${this.db}\`.\`${this.typesTable}\` (
            \`id\` INT NOT NULL AUTO_INCREMENT,
            \`definition_type\` VARCHAR(45) NOT NULL,
            \`description\` TEXT NOT NULL,
            \`active\` VARCHAR(1) NULL,
            \`created_at\` datetime(6) NOT NULL,
            \`creator_user_id\` VARCHAR(300) NOT NULL,
            \`updated_at\` datetime(6) NOT NULL,
            \`modifier_user_id\` VARCHAR(300) NULL,
            PRIMARY KEY (\`id\`),
            UNIQUE INDEX \`adm_definition_types_uk\` (\`definition_type\` ASC))
          ENGINE = InnoDB`,
    );

    await queryRunner.query(`ALTER TABLE  \`${this.db}\`.\`${this.typesTable}\`
      ADD UNIQUE INDEX \`fk_DEFINITION_TYPES_UK\` (\`definition_type\` ASC)`);

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS \`${this.db}\`.\`${this.valuesTable}\` (
            \`id\` INT NOT NULL AUTO_INCREMENT,
            \`value_definition\` VARCHAR(60) NOT NULL,
            \`description\` VARCHAR(200) NOT NULL,
            \`active\` VARCHAR(1) NULL DEFAULT 'Y',
            \`validation_type\` VARCHAR(45) NULL,
            \`definition_type_id\` INT NOT NULL,
            \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`creator_user_id\` VARCHAR(300) NOT NULL,
            \`updated_at\` datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            \`modifier_user_id\` VARCHAR(300) NULL,
            PRIMARY KEY (\`id\`),
            INDEX \`VALUES_DEFINITIONS_DEFINITION_TYPES1_idx\` (\`definition_type_id\` ASC),
            UNIQUE INDEX \`VALUES_DEFINITIONS_DEFINITION_TYPES1_uk\` (\`definition_type_id\` ASC, \`description\` ASC),
            CONSTRAINT \`VALUES_DEFINITIONS_DEFINITION_TYPES_fk\`
              FOREIGN KEY (\`definition_type_id\`)
              REFERENCES \`${this.db}\`.\`${this.valuesTable}\` (\`id\`)
              ON DELETE NO ACTION
              ON UPDATE NO ACTION)
          ENGINE = InnoDB;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`${this.db}\`.\`${this.typesTable}\``);
    await queryRunner.query(
      `DROP TABLE \`${this.db}\`.\`${this.valuesTable}\``,
    );
  }
}
