import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    JoinColumn,
    OneToOne,
    UpdateDateColumn,
    CreateDateColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';

@Entity({ name: 'organization_appointment_meetings' })
export class AppointmentMeeting {
    
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Appointment)
    @JoinColumn({ name: 'organization_appointment_id', referencedColumnName: 'id' })
    appointment: Appointment;

    @Column({ nullable: false })
    sid: string;

    @Column({ nullable: false })
    unique_name: string;

    @Column({ nullable: true })
    sid_composition: string;

    @Column({ nullable: false })
    status: string;
    
    @Column({ nullable: false, name: 'started_at' })
    startedAt: Date;

    @Column({ nullable: false, name: 'ended_at' })
    endedAt: Date;
    
    @CreateDateColumn({ nullable: false, name: 'created_at' })
    createAt: Date;

    @UpdateDateColumn({ nullable: false, name: 'updated_at' })
    updateAt: Date;

    @Column({ nullable: true })
    bitrate_kbps: number;

    @Column({ nullable: true })
    duration_seconds: number;

    @Column({ nullable: true })
    file_format: string;

    @Column({ nullable: true })
    file_upload_status: string;
}

export class AppointmentMeetingDTO {
    id: number;
    appointmentID?: number;
    sid: string;
    unique_name: string;
    status: string;
    startedAt?: string;
    endedAt?: string;
    createAt?: Date;
    updateAt?: Date;
    mp3File?: string;
    sid_composition?: string;
}