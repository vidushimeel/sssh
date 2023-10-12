import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { UserApp } from "./userApp.entity";
import { Appointment } from "./appointment.entity";

@Entity({ name: "patients" })
export class Patients {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  uuid: string;

  @Column({ nullable: true })
  organization_id: number;

  @Column({ nullable: true })
  social_security_number: string;

  @Column({ nullable: true })
  user_id: number;

  @Column({ nullable: true })
  created_by: number;

  @Column({ nullable: true })
  primary_provider: number;

  @Column({ nullable: true })
  last_updated_by: number;

  @CreateDateColumn({ nullable: true, name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ nullable: true, name: "updated_at" })
  updated_at: Date;

  @OneToOne(() => UserApp)
  @JoinColumn({ name: "user_id", referencedColumnName: "id" })
  userApp: UserApp;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments: Appointment[];
}

export class PatientDTO {
  id?: number;
  uuid: string;
  created_by: number;
  organization_id: number;
  social_security_number: string;
  user_id: number;
  primary_provider: number;
  last_updated_by: number;
  created_at: Date;
  updated_at: Date;
}
