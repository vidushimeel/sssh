import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToOne,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';
import { UserApp } from './userApp.entity';
import { Sites } from './sites.entity';
import { Patients } from './patients.entity';

@Entity({ name: 'organization_appointments' })

export class Appointment {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ nullable: false })
    uuid: string;

    @Column({ nullable: false })
    organization_id: number;

    @Column({ nullable: false })
    patient_id: number;

    @Column({ nullable: false })
    last_updated_by: number;

    @Column({ nullable: false })
    date: Date;

    @Column({ nullable: false })
    urgency: string;

    @Column({ nullable: false })
    type: string;

    @Column({ nullable: true })
    visit_number: string;

    @Column({ nullable: false })
    assigned_user_id: number;

    @Column({ nullable: true })
    cancel_reason: string;

    @OneToOne(() => UserApp)
    @JoinColumn({ name: 'assigned_user_id', referencedColumnName: 'id' })
    userApp: UserApp;

    @ManyToOne(() => Patients, (patient) => patient.appointments)
    patient: Patients;

    @OneToOne(() => Sites)
    @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
    siteData: Sites;

    @CreateDateColumn({ nullable: false, name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ nullable: false, name: 'updated_at' })
    updated_at: Date;
}

export class AppointmentDTO {
    id: number;
    uuid?: string;
    organization_id: number;
    patient_id: number;
    last_updated_by: number;
    date?: Date;
    urgency?: string;
    type?: string;
    visit_number?: string;
    assigned_user_id?: number;
    created_at: Date;
    updated_at: Date;
    site_id: number;
}

export class AppointmentFullDTO {
    Patients:{
        Demographics: {
            FirstName: string;
            LastName?: string; 
            MiddleName: string;
            PhoneNumber: {
                Home?: string;
                Mobile: string;
            };
            EmailAddress: string;
            Address: {
                StreetAddress: string;
                City: string;
            };
            Sex: string; 
            SSN: string;
            DOB: string;
        },
        Identifiers: [
            {
                ID: number; 
                IDType: string;
            }, 
        ]
    }
    Visit: {
        AttendingProvider: {
            IDType: string;
            ID: string;
        },
        VisitNumber: string;
        VisitDateTime: string;
        Priority: string;
        siteUuid: number;
    }
    startedAt: string;
    endedAt: string;
    mp3File: string;
}