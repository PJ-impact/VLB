import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module.js';
import { visitors } from '../database/schema.js';
import { CreateVisitorDto } from './dto/create-visitors.dto.js';

@Injectable()
export class VisitorsService {
  constructor(@Inject(DRIZZLE) private readonly db: any) {}

  // 1. Public Kiosk: Check in a visitor
  async checkIn(dto: CreateVisitorDto) {
    const [newVisitor] = await this.db
      .insert(visitors)
      .values({
        name: dto.name,
        isCompany: dto.isCompany,
        affiliation: dto.affiliation,
        host: dto.host,
        status: 'active',
      })
      .returning();

    return {
      message: 'Visitor checked in successfully',
      visitor: newVisitor,
    };
  }

  // 2. Receptionist & Admin: View all currently active visitors
  async getActiveVisitors() {
    return this.db
      .select()
      .from(visitors)
      .where(eq(visitors.status, 'active'))
      .orderBy(desc(visitors.id));
  }

  // 3. Receptionist & Admin: Check out a visitor
  async checkOut(id: number) {
    const [updated] = await this.db
      .update(visitors)
      .set({
        status: 'completed',
        checkOutTime: new Date().toISOString(),
      })
      .where(eq(visitors.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Visitor with ID ${id} not found`);
    }

    return {
      message: 'Visitor checked out successfully',
      visitor: updated,
    };
  }

  // 4. Admin Only: View all historical logs
  async getAllHistory() {
    return this.db
      .select()
      .from(visitors)
      .orderBy(desc(visitors.id));
  }
}