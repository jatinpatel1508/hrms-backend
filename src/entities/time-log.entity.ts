import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';
import { Company } from './company.entity';
import { Task } from './task.entity';

@Entity('time_logs')
export class TimeLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.timeLogs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Project, (project) => project.timeLogs, { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @ManyToOne(() => Task, { nullable: true })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ name: 'task_id', nullable: true })
  taskId: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'integer', default: 0 })
  duration: number; // in seconds

  @Column({ type: 'integer', default: 0 })
  idleTime: number; // idle time in seconds

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

