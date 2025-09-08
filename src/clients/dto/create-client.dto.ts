import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ClientStatus } from '@prisma/client';

/**
 * DTO for creating a new client
 */
export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;
}
