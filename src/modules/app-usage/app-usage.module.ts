import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppUsageService } from './app-usage.service';
import { AppUsageController } from './app-usage.controller';
import { AppUsageLog } from '../../entities/app-usage-log.entity';
import { EventsGateway } from '../../gateway/events.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([AppUsageLog])],
  controllers: [AppUsageController],
  providers: [AppUsageService],
  exports: [AppUsageService],
})
export class AppUsageModule {}

