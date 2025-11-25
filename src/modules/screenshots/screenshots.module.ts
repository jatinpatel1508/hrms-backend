import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScreenshotsService } from './screenshots.service';
import { ScreenshotsController } from './screenshots.controller';
import { Screenshot } from '../../entities/screenshot.entity';
import { EventsGateway } from '../../gateway/events.gateway';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Screenshot]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/screenshots',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [ScreenshotsController],
  providers: [ScreenshotsService],
  exports: [ScreenshotsService],
})
export class ScreenshotsModule {}

