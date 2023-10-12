import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    CreateDateColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';

@Entity({ name: 'transcription_meetings' })
export class TranscriptionMeetings {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    unique_name: string;

    @OneToOne(() => Appointment)
    @JoinColumn({ name: 'unique_name', referencedColumnName: 'uuid' })
    appointment: Appointment;

    @Column({ nullable: true })
    sid_mka: string;

    @Column({ nullable: false })
    job_id: string;

    @Column({ nullable: false })
    job_status: string;

    @Column({ nullable: true, name: 'accountSid' })
    accountSid: string;

    @Column({ nullable: true })
    room_sid: string;

    @Column({ nullable: true })
    participant_sid: string;
    
    @CreateDateColumn({ nullable: false })
    created_at: Date;

    @UpdateDateColumn({ nullable: false })
    updated_at: Date;

    @Column('json', { nullable: true, default: {} })
    job_transcription: string;

    @Column('json', { nullable: true, default: {} })
    meeting_transcription: string;

    @Column('json', { nullable: true, default: {} })
    entities_transcription: string;

    @Column('json', { nullable: true, default: {} })
    rxnorm_transcription: string;

    @Column('json', { nullable: true, default: {} })
    icd10_transcription: string;

    @Column('json', { nullable: true, default: {} })
    snomed_transcription: string;

    @Column('json', { nullable: true, default: {} })
    cpt_transcription: string;

    @Column('json', { nullable: true, default: {} })
    imo_rxnorm_transcription: string;

    @Column('json', { nullable: true, default: {} })
    imo_icd10_transcription: string;

    @Column('json', { nullable: true, default: {} })
    imo_snomed_transcription: string;

    @Column('json', { nullable: true, default: {} })
    imo_cpt_transcription: string;

    @Column('json', { nullable: true, default: {} })
    imo_hcpcs_transcription: string;
}

export class TranscriptionMeetingsDTO {
    id: number;
    unique_name: string;
    sid_mka?: string;
    job_id: string;
    job_status: string;
    accountSid?: string;
    room_sid?: string;
    participant_sid?: string;
    created_at: Date;
    updated_at: Date;
    job_transcription?: string;
    meeting_transcription?: string;
    entities_transcription?: string;
    rxnorm_transcription?: string;
    icd10_transcription?: string;
    snomed_transcription?: string;
}