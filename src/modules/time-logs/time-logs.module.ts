import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeLogsService } from './time-logs.service';
import { TimeLogsController } from './time-logs.controller';
import { TimeLog } from '../../entities/time-log.entity';
import { Task } from '../../entities/task.entity';
import { Project } from '../../entities/project.entity';
import { EventsGateway } from '../../gateway/events.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([TimeLog, Task, Project])],
  controllers: [TimeLogsController],
  providers: [TimeLogsService],
  exports: [TimeLogsService],
})
export class TimeLogsModule {}

