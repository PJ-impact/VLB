import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { DRIZZLE } from '../database/database.module.js';
import { users } from '../database/schema.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private readonly db: any,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Check if user already exists
    const [existing] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    // 2. Hash password with bcrypt (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Store in SQLite
    const [newUser] = await this.db
      .insert(users)
      .values({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    return {
      message: 'User registered successfully',
      user: newUser,
    };
  }

  async login(dto: LoginDto) {
    // 1. Find user by email
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Compare plain password with stored hash
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Issue JWT Token
    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}