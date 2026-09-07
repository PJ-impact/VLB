import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VisitorsService } from './visitors.service.js';
import { CreateVisitorDto } from './dto/create-visitors.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@ApiTags('Visitors')
@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  // ─── Public Kiosk Route ───────────────────────────────────────────────────
  @ApiOperation({ summary: 'Public Kiosk: Visitor check-in form submission' })
  @Post('check-in')
  async checkIn(@Body() dto: CreateVisitorDto) {
    return this.visitorsService.checkIn(dto);
  }

  // ─── Staff Routes (Receptionist & Admin) ──────────────────────────────────
  @ApiOperation({ summary: 'Staff: Get all currently active visitors in the building' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('receptionist', 'admin')
  @Get('active')
  async getActiveVisitors() {
    return this.visitorsService.getActiveVisitors();
  }

  @ApiOperation({ summary: 'Staff: Check out an active visitor by ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('receptionist', 'admin')
  @Patch(':id/check-out')
  async checkOut(@Param('id', ParseIntPipe) id: number) {
    return this.visitorsService.checkOut(id);
  }

  // ─── Admin Only Route ─────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Admin Only: Full historical visitor logs' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('history')
  async getHistory() {
    return this.visitorsService.getAllHistory();
  }
}