import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserTable1667440977429 implements MigrationInterface {
  db = process.env.DB_DATABASE;
  TABLE_USERS = 'USERS_API';
  TABLE_VALUE_DEFINITIONS = 'VALUES_DEFINITIONS';
  public async up(queryRunner: QueryRunner): Promise<void> {
    // USERS
    await queryRunner.createTable(
      new Table({
        name: this.TABLE_USERS,
        columns: [
          {
            name: 'id',
            type: 'int',
            isNullable: false,
            isGenerated: true,
            generationStrategy: 'increment',
            isPrimary: true,
            width: 11,
          },
          {
            name: 'sub_cognito_id',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
            length: '255',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
            length: '255',
          },
          {
            name: 'first_name',
            type: 'varchar',
            isNullable: false,
            length: '255',
          },
          {
            name: 'middle_name',
            type: 'varchar',
            isNullable: true,
            length: '255',
          },
          {
            name: 'last_name',
            type: 'varchar',
            isNullable: false,
            length: '255',
          },
          {
            name: 'phone',
            type: 'varchar',
            isNullable: true,
            length: '255',
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
            length: '255',
            isUnique: true,
          },
          {
            name: 'home_address',
            type: 'varchar',
            isNullable: true,
            length: '500',
          },
          {
            name: 'date_invited',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'date_registered',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'last_login',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'photo_url',
            type: 'varchar',
            isNullable: true,
            length: '500',
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'NOW()',
            isNullable: false,
          },
          {
            name: 'creator_user_id',
            type: 'varchar',
            isNullable: false,
            length: '255',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'NOW()',
            isNullable: true,
          },
          {
            name: 'modifier_user_id',
            type: 'varchar',
            isNullable: true,
            length: '255',
          },
          {
            name: 'status_id',
            type: 'int',
            isNullable: false,
            width: 11,
          },
          {
            name: 'type_id',
            type: 'int',
            isNullable: false,
            width: 11,
          },
          {
            name: 'role_id',
            type: 'int',
            isNullable: false,
            width: 11,
          },
        ],
        indices: [
          { name: 'status_id_idx', columnNames: ['status_id'] },
          { name: 'type_id_idx', columnNames: ['type_id'] },
          { name: 'role_id_idx', columnNames: ['role_id'] },
        ],
        foreignKeys: [
          {
            name: `${this.TABLE_USERS}_${this.TABLE_VALUE_DEFINITIONS}_status_fk`,
            columnNames: ['status_id'],
            referencedColumnNames: ['id'],
            referencedTableName: this.TABLE_VALUE_DEFINITIONS,
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION',
          },
          {
            name: `${this.TABLE_USERS}_${this.TABLE_VALUE_DEFINITIONS}_type_fk`,
            columnNames: ['type_id'],
            referencedColumnNames: ['id'],
            referencedTableName: this.TABLE_VALUE_DEFINITIONS,
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION',
          },
          {
            name: `${this.TABLE_USERS}_${this.TABLE_VALUE_DEFINITIONS}_role_fk`,
            columnNames: ['role_id'],
            referencedColumnNames: ['id'],
            referencedTableName: this.TABLE_VALUE_DEFINITIONS,
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION',
          },
        ],
      }),
      false,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.TABLE_USERS, true, true, true);
  }
}
