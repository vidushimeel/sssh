import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'BOAT' })
export class Boat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  make: string;

  @Column({ nullable: false, type: 'decimal', precision: 10, scale: 2 })
  length_in_feet: number;

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  created_at: Date;

  @Column({ nullable: false })
  created_by_id: string;

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updated_at: Date;

  @Column({ nullable: true })
  modified_by_id: string;
}
