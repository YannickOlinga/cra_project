import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { ActivityReport } from '../../activity-reports/entities/activity-report.entity';

@Entity('activity_reports_costs')
export class ActivityReportsCost {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', name: 'activity_reports_id' })
  activity_reports_id: number;

  @Column('text')
  label: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('text')
  category: string;

  @ManyToOne(() => ActivityReport, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'activity_reports_id' })
  activity_report: Relation<ActivityReport>;
}
