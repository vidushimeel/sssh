import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

@Entity({ name: 'users' })

export class UserApp {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    last_name: string;

    @Column({ nullable: false })
    email: string;

    @Column({ nullable: false })
    email_verified_at: string;

    @Column({ nullable: false })
    password: string;

    @Column({ nullable: false })
    address1: string;

    @Column({ nullable: false })
    address2: string;

    @Column({ nullable: false })
    city: string;

    @Column({ nullable: false })
    state: string;

    @Column({ nullable: false })
    country: string;

    @Column({ nullable: false })
    zipcode: string;

    @Column({ nullable: false })
    phone1: string;

    @Column({ nullable: false })
    phone2: string;

    @Column({ nullable: false })
    date_of_birth: string;

    @Column({ nullable: false })
    gender: string;

    @Column({ nullable: false })
    current_team_id: number;

    @Column({ nullable: false })
    profile_photo_path: string;
    
    @Column({ nullable: false })
    is_provider: boolean;

    @Column({ nullable: false })
    is_admin: boolean;

    @Column('json', { nullable: false, default: {} })
    identifiers: string;

    @CreateDateColumn({ nullable: false, name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ nullable: false, name: 'updated_at' })
    updated_at: Date;
}

export class UserAppDTO {
    id: null;
    name: string;
    last_name: string;
    email: string;
    password: string;
    address1: string;
    city: string;
    phone1: string;
    phone2: string;
    date_of_birth: string;
    gender: string;
    identifiers: string;
    created_at: Date;
    updated_at: Date;
}