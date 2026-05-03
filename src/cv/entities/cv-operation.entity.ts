import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type CvOperationType = 'CREATE' | 'UPDATE' | 'DELETE';

@Entity()
export class CvOperation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  operationType: CvOperationType;

  @CreateDateColumn({ type: 'datetime' })
  occurredAt: Date;

  @Column({ type: 'int', nullable: true })
  actorId: number | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  actorUsername: string | null;

  @Column({ type: 'varchar', length: 20, default: 'user' })
  actorRole: string;

  @Column({ type: 'int', nullable: true })
  cvId: number | null;

  @Column({ type: 'int', nullable: true })
  cvOwnerId: number | null;

  @Column({ type: 'json', nullable: true })
  details: Record<string, unknown> | null;
}
