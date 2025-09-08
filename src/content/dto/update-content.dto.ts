import { PartialType } from '@nestjs/mapped-types';
import { CreateContentDto } from './create-content.dto';

/**
 * DTO for updating content
 */
export class UpdateContentDto extends PartialType(CreateContentDto) {}
