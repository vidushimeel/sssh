import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DefinitionType } from '.';

@Entity({ name: 'VALUES_DEFINITIONS' })
export class ValueDefinition {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'value_definition' })
  valueDefinition: string;

  @Column()
  description: string;

  @Column()
  active: boolean;

  @Column({ name: 'validation_type' })
  validationType?: string;

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

  @ManyToOne(() => DefinitionType, {})
  @JoinColumn({ name: 'definition_type_id' })
  definitionType: DefinitionType;
}
