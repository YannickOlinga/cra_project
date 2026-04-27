import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OneToOne, JoinColumn } from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column('varchar', { length: 100, nullable: true })
  company?: string;

  @Column('varchar', { length: 100, nullable: true, unique: true })
  identifier?: string;

  @OneToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'users_id' })
  user!: User;
}
