import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ValueDefinition } from './valueDefinition.entity';

@Entity({ name: 'USERS_API' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, name: 'sub_cognito_id' })
  subCognitoId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, name: 'first_name' })
  firstName: string;

  @Column({ nullable: true, name: 'middle_name' })
  middleName: string;

  @Column({ nullable: false, name: 'last_name' })
  lastName: string;

  @Column({ nullable: false })
  phone: string;

  @Column({ nullable: false, unique: false })
  email: string;

  @Column({ nullable: true, name: 'home_address' })
  homeAddress: string;

  @Column({ nullable: true, name: 'date_invited' })
  dateInvited: Date;

  @Column({ nullable: true, name: 'date_registered' })
  dateRegistered: Date;

  @Column({ nullable: true, name: 'last_login' })
  lastLogin: Date;

  @Column({ nullable: true, name: 'photo_url' })
  photo_url: string;

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  createdAt: Date;

  @Column({ nullable: false, name: 'creator_user_id' })
  creatorUserId: string;

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true, name: 'modifier_user_id' })
  modifierUserId: string;

  @ManyToOne(
    () => ValueDefinition,
    (valueDefinition: ValueDefinition) => valueDefinition.id,
    {},
  )
  @JoinColumn({ name: 'status_id' })
  status: ValueDefinition;

  @ManyToOne(
    () => ValueDefinition,
    (valueDefinition: ValueDefinition) => valueDefinition.id,
    {},
  )
  @JoinColumn({ name: 'type_id' })
  type: ValueDefinition;

  @ManyToOne(
    () => ValueDefinition,
    (valueDefinition: ValueDefinition) => valueDefinition.id,
    {},
  )
  @JoinColumn({ name: 'role_id' })
  role: ValueDefinition;
}
