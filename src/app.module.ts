import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TimeLogsModule } from './modules/time-logs/time-logs.module';
import { AppUsageModule } from './modules/app-usage/app-usage.module';
import { ScreenshotsModule } from './modules/screenshots/screenshots.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { SettingsModule } from './modules/settings/settings.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { typeOrmConfig } from './config/typeorm.config';
import { EventsGateway } from './gateway/events.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
        },
      }),
      global: true,
    }),
    AuthModule,
    UsersModule,
    ProjectsModule,
    TimeLogsModule,
    AppUsageModule,
    ScreenshotsModule,
    PayrollModule,
    SettingsModule,
    CompaniesModule,
    TasksModule,
  ],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class AppModule {}

