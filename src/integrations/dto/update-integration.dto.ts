import { PartialType } from '@nestjs/mapped-types';
import { CreateIntegrationDto } from './create-integration.dto';

/**
 * DTO for updating an integration
 */
export class UpdateIntegrationDto extends PartialType(CreateIntegrationDto) {}
