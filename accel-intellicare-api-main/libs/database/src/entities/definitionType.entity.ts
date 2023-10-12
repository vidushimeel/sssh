import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

@Entity({ name: 'DEFINITION_TYPES' })
export class DefinitionType {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'definition_type' })
  definitionType: string;

  @Column()
  description?: string;

  @Column()
  active?: boolean;

  @CreateDateColumn({
    nullable: false,
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt?: Date;

  @UpdateDateColumn({
    nullable: true,
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt?: Date;

  @Column({ nullable: false, name: 'creator_user_id' })
  creatorUserId?: string;
  @Column({ name: 'modifier_user_id' })
  modifierUserId?: string;
}
