import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Provider } from '../../providers/entities/provider.entity';
import type { Relation } from 'typeorm';

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

  @ManyToOne(() => Provider, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'providers_id' })
  provider?: Relation<Provider> | null;
}
