import { Injectable, NotFoundException, Inject, forwardRef, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Screenshot, ScreenshotType } from '../../entities/screenshot.entity';
import { CreateScreenshotDto } from './dto/create-screenshot.dto';
import { EventsGateway } from '../../gateway/events.gateway';

@Injectable()
export class ScreenshotsService {
  constructor(
    @InjectRepository(Screenshot)
    private screenshotsRepository: Repository<Screenshot>,
    @Optional()
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway?: EventsGateway,
  ) {}

  async create(createScreenshotDto: CreateScreenshotDto, file: Express.Multer.File, companyId: string): Promise<Screenshot> {
    const screenshot = this.screenshotsRepository.create({
      ...createScreenshotDto,
      filePath: file.path,
      fileName: file.filename,
      fileSize: file.size,
      companyId,
    });
    const saved = await this.screenshotsRepository.save(screenshot);
    // Emit WebSocket event
    if (this.eventsGateway && createScreenshotDto.userId) {
      this.eventsGateway.emitScreenshotUpdate(createScreenshotDto.userId, saved);
    }
    return saved;
  }

  async findAll(companyId?: string, userId?: string, startDate?: Date, endDate?: Date): Promise<Screenshot[]> {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (userId) where.userId = userId;
    if (startDate && endDate) {
      where.capturedAt = Between(startDate, endDate);
    }

    return this.screenshotsRepository.find({
      where,
      relations: ['user', 'company'],
      order: { capturedAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId?: string): Promise<Screenshot> {
    const where: any = { id };
    if (companyId) where.companyId = companyId;
    const screenshot = await this.screenshotsRepository.findOne({
      where,
      relations: ['user', 'company'],
    });
    if (!screenshot) {
      throw new NotFoundException(`Screenshot with ID ${id} not found`);
    }
    return screenshot;
  }

  async remove(id: string, companyId?: string): Promise<void> {
    await this.findOne(id, companyId); // Verify access
    // TODO: Delete file from filesystem
    await this.screenshotsRepository.delete(id);
  }
}

