import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { AssistantStatus } from '@prisma/client';

/**
 * DTO for creating a new assistant
 */
export class CreateAssistantDto {
  @IsInt()
  @IsNotEmpty()
  clientId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  openaiAssistantId: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  @Min(0)
  @Max(2)
  temperature: number;

  @IsString()
  @IsNotEmpty()
  instructions: string;

  @IsEnum(AssistantStatus)
  @IsOptional()
  status?: AssistantStatus;
}
