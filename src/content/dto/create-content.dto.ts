import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ContentStatus } from '@prisma/client';

/**
 * DTO for creating new content
 */
export class CreateContentDto {
  @IsInt()
  @IsNotEmpty()
  clientId: number;

  @IsInt()
  @IsNotEmpty()
  assistantId: number;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsObject()
  @IsNotEmpty()
  parameters: Record<string, any>;

  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus;
}
