import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  Request,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ScreenshotsService } from './screenshots.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateScreenshotDto } from './dto/create-screenshot.dto';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller('screenshots')
@UseGuards(JwtAuthGuard)
export class ScreenshotsController {
  constructor(private readonly screenshotsService: ScreenshotsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createScreenshotDto: CreateScreenshotDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    return this.screenshotsService.create(
      {
        ...createScreenshotDto,
        userId: req.user.id,
      },
      file,
      req.user.companyId,
    );
  }

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req?: any,
  ) {
    // Super admin can see all screenshots, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    const filterUserId = req.user.role === 'admin' || req.user.role === 'manager' || req.user.role === 'super_admin' ? userId : req.user.id;
    return this.screenshotsService.findAll(
      companyId,
      filterUserId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    // Super admin can see any screenshot, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.screenshotsService.findOne(id, companyId);
  }

  @Get(':id/file')
  async getFile(@Param('id') id: string, @Request() req, @Res() res: Response) {
    // Super admin can access any screenshot file, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    const screenshot = await this.screenshotsService.findOne(id, companyId);
    const filePath = join(process.cwd(), screenshot.filePath);
    
    if (existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    return res.status(404).send('File not found');
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    // Super admin can delete any screenshot, others only their company
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.screenshotsService.remove(id, companyId);
  }
}

