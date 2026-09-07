import { Module } from '@nestjs/common';
import { VisitorsService } from './visitors.service.js';
import { VisitorsController } from './visitors.controller.js';
import{AuthModule} from '../auth/auth.module.js'

@Module({
  controllers: [VisitorsController],
  providers: [VisitorsService],
  imports: [AuthModule]
})
export class VisitorsModule {}