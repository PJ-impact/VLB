import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateVisitorDto {
  @ApiProperty({ example: 'Kwame Mensah' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: true, description: 'True if visiting for a company, false for individual' })
  @IsBoolean()
  isCompany: boolean;

  @ApiProperty({
    example: 'Tech Solutions Ltd / Job Applicant',
    description: 'Company name or custom identity representation',
  })
  @IsString()
  @IsNotEmpty()
  affiliation: string;

  @ApiProperty({ example: 'Dr. Arthur - IT Department' })
  @IsString()
  @IsNotEmpty()
  host: string;
}