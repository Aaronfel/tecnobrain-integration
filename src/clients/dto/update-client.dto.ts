import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';

/**
 * DTO for updating a client
 */
export class UpdateClientDto extends PartialType(CreateClientDto) {}
