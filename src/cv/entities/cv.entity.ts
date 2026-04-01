import { Skill } from '../../skill/entities/skill.entity';
import { User } from '../../user/entities/user.entity';
import {Entity,PrimaryGeneratedColumn,Column,ManyToOne,ManyToMany,JoinTable} from 'typeorm';
@Entity()
export class Cv {
  @PrimaryGeneratedColumn()
    id: number;
    
  @Column()
    name: string;
    
  @Column()
    firstname: string;
    
  @Column()
    age: number;
    
  @Column()
    Cin: string;
    
  @Column()
    Job: string;
    
  @Column()
    path: string;
    
  @ManyToOne(() => User, (user) => user.cvs, { onDelete: 'CASCADE' })
    user: User;
    
  @ManyToMany(() => Skill, { onDelete: 'CASCADE' })
  @JoinTable()
    skills: Skill[];
    
}
