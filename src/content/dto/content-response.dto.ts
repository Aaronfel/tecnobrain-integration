import { ContentStatus } from '@prisma/client';

/**
 * DTO for content response
 */
export class ContentResponseDto {
  id: number;
  clientId: number;
  assistantId: number;
  type: string;
  parameters: Record<string, any>;
  status: ContentStatus;
  requestedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}
