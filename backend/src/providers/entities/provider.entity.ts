import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ManyToOne, JoinColumn } from 'typeorm';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'users_id' })
  user!: User;
}
