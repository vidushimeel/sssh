import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn
} from 'typeorm';

@Entity({ name: 'sites' })
export class Sites {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ nullable: false })
    uuid: string;

    @Column({ nullable: false })
    sub_organization_id: number;

    @Column({ nullable: false })
    name: string;

    @CreateDateColumn({ nullable: true, name: 'created_at' })
    created_at: Date;

    @UpdateDateColumn({ nullable: true, name: 'updated_at' })
    updated_at: Date;
}

export class SitesDTO {
    id?: number;
    uuid: string;
    name: string;
    sub_organization_id: number;
    created_at: Date;
    updated_at: Date;
};