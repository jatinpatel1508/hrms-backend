import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  create(@Body() createSettingDto: CreateSettingDto, @Request() req) {
    return this.settingsService.create({
      ...createSettingDto,
      companyId: req.user.role === 'super_admin' ? createSettingDto.companyId : req.user.companyId,
    });
  }

  @Get()
  findAll(@Request() req) {
    // Super admin can see global settings, others see company settings
    if (req.user.role === 'super_admin') {
      return this.settingsService.findAll();
    }
    return this.settingsService.findAll(req.user.companyId);
  }

  @Get(':key')
  findOne(@Param('key') key: string, @Request() req) {
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.settingsService.findOne(key, companyId);
  }

  @Get(':key/value')
  getValue(@Param('key') key: string, @Request() req) {
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.settingsService.getValue(key, companyId);
  }

  @Patch(':key')
  update(@Param('key') key: string, @Body() updateSettingDto: UpdateSettingDto, @Request() req) {
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.settingsService.update(key, updateSettingDto, companyId);
  }

  @Delete(':key')
  remove(@Param('key') key: string, @Request() req) {
    const companyId = req.user.role === 'super_admin' ? undefined : req.user.companyId;
    return this.settingsService.remove(key, companyId);
  }
}

