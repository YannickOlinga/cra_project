import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Provider } from '../../providers/entities/provider.entity';
import { Customer } from '../../customers/entities/customer.entity';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  hourly_rate: number;

  @Column('decimal', { precision: 10, scale: 2 })
  budget: number;

  @Column('text', { nullable: true })
  label?: string;

  @Column({ type: 'int', name: 'providers_id' })
  providers_id: number;

  @Column({ type: 'int', name: 'customers_id' })
  customers_id: number;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'providers_id' })
  provider: Relation<Provider>;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'customers_id' })
  customer: Relation<Customer>;
}
