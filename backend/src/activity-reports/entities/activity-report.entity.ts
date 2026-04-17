import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Provider } from '../../providers/entities/provider.entity';

@Entity('activity_reports')
export class ActivityReport {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('int')
  month: number;

  @Column('int')
  year: number;

  @Column({ type: 'int', name: 'providers_id' })
  providers_id: number;

  @ManyToOne(() => Provider, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'providers_id' })
  provider: Relation<Provider>;
}
