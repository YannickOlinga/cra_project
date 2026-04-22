import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Assignment } from '../../assignments/entities/assignment.entity';
import { ActivityReport } from '../../activity-reports/entities/activity-report.entity';
import { PastDay } from 'common/enums/past_day';

@Entity('activity_reports_lines')
export class ActivityReportsLine {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('int')
  day: number;

  @Column('float', {
    name: 'past_day',
  })
  past_day: PastDay;

  @Column({ type: 'int', name: 'activity_reports_id' })
  activity_reports_id: number;

  @ManyToOne(() => ActivityReport, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'activity_reports_id' })
  activity_report: Relation<ActivityReport>;

  @Column({ type: 'int', name: 'assignments_id' })
  assignments_id: number;

  @ManyToOne(() => Assignment, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'assignments_id' })
  assignment: Relation<Assignment>;
}
