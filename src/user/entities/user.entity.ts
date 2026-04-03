import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Cv } from '../../cv/entities/cv.entity';
import { UserRoleEnum } from '../../enums/user-role.enum';
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
  
  @Column({
        type: 'enum',
        enum: UserRoleEnum,
        default: UserRoleEnum.USER
    })
    role: UserRoleEnum;

  @OneToMany(() => Cv, (cv) => cv.user)
    cvs: Cv[];
    
}
