import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TimeLog } from './time-log.entity';
import { AppUsageLog } from './app-usage-log.entity';
import { Screenshot } from './screenshot.entity';
import { PayrollRecord } from './payroll-record.entity';
import { Company } from './company.entity';
import { Task } from './task.entity';

export enum UserRole {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, (company) => company.users)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'company_id' })
  companyId: string;

  @Index(['email', 'companyId'], { unique: true })
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => TimeLog, (timeLog) => timeLog.user)
  timeLogs: TimeLog[];

  @OneToMany(() => AppUsageLog, (appUsageLog) => appUsageLog.user)
  appUsageLogs: AppUsageLog[];

  @OneToMany(() => Screenshot, (screenshot) => screenshot.user)
  screenshots: Screenshot[];

  @OneToMany(() => PayrollRecord, (payrollRecord) => payrollRecord.user)
  payrollRecords: PayrollRecord[];

  @OneToMany(() => Task, (task) => task.assignedUser)
  assignedTasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

