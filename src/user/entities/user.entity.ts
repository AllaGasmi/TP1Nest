import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Cv } from '../../cv/entities/cv.entity';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
    id: number;
    
  @Column({ unique: true })
    username: string;
    
  @Column({ unique: true })
    email: string;
    
  @Column()
    password: string;

  @Column({ type: 'varchar', length: 20, default: 'user' })
    role: 'admin' | 'user';

  @OneToMany(() => Cv, (cv) => cv.user)
    cvs: Cv[];
    
}
