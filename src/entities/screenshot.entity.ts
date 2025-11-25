import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';

export enum ScreenshotType {
  FULL = 'full',
  BLURRED = 'blurred',
  THUMBNAIL = 'thumbnail',
}

@Entity('screenshots')
export class Screenshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.screenshots)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column()
  filePath: string;

  @Column()
  fileName: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({
    type: 'enum',
    enum: ScreenshotType,
    default: ScreenshotType.FULL,
  })
  type: ScreenshotType;

  @Column({ type: 'timestamp' })
  capturedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

