import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Provider } from '../../providers/entities/provider.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';

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

  @Column({ type: 'int', name: 'assignments_id', nullable: true })
  assignments_id?: number | null;

  @Column('varchar', { length: 20, default: 'active' })
  status: 'active' | 'completed';

  @Column('simple-array', {
    name: 'assignment_ids',
    nullable: true,
    transformer: {
      to: (value?: number[] | null) => (value?.length ? value : null),
      from: (value?: string[] | string | null) => {
        if (Array.isArray(value)) {
          return value.map(Number).filter(Boolean);
        }

        if (typeof value === 'string') {
          return value.split(',').map(Number).filter(Boolean);
        }

        return [];
      },
    },
  })
  assignment_ids?: number[];

  @ManyToOne(() => Provider, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'providers_id' })
  provider: Relation<Provider>;

  @ManyToOne(() => Assignment, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'assignments_id' })
  assignment?: Relation<Assignment> | null;
}
