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

@Entity({ name: 'organization_members' })

export class OrganizationMembers {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ nullable: false })
    organization_id: number;

    @Column({ nullable: false })
    user_id: number;

    @Column({ nullable: false })
    added_by: number;

    @Column({ nullable: false })
    role: string;

    @Column({ nullable: false })
    is_admin: number;

    @OneToOne(() => UserApp)
    @JoinColumn({ name: 'is_admin', referencedColumnName: 'id' })
    userApp: UserApp;

    @CreateDateColumn({ nullable: false, name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ nullable: false, name: 'updated_at' })
    updated_at: Date;
}
