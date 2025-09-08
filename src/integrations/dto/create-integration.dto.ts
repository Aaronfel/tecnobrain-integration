import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { IntegrationStatus } from '@prisma/client';

/**
 * DTO for creating a new integration
 */
export class CreateIntegrationDto {
  @IsInt()
  @IsNotEmpty()
  clientId: number;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsObject()
  @IsNotEmpty()
  credentials: Record<string, any>;

  @IsString()
  @IsUrl()
  @IsOptional()
  webhookUrl?: string;

  @IsEnum(IntegrationStatus)
  @IsOptional()
  status?: IntegrationStatus;
}
