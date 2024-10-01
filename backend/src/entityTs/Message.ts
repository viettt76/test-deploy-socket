import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity({ name: 'message' })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  sender!: string;

  @Column({ type: 'uuid', nullable: true })
  receiver?: string;

  @Column({ type: 'uuid', nullable: true })
  recipientGroup?: string;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ type: 'varchar', nullable: true })
  picture?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender', referencedColumnName: 'id'})
  senderInfo: User
}
