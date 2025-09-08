import { PartialType } from '@nestjs/mapped-types';
import { CreateAssistantDto } from './create-assistant.dto';

/**
 * DTO for updating an assistant
 */
export class UpdateAssistantDto extends PartialType(CreateAssistantDto) {}
