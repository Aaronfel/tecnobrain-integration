import { AssistantStatus } from '@prisma/client';

/**
 * DTO for assistant response
 */
export class AssistantResponseDto {
  id: number;
  clientId: number;
  name: string;
  openaiAssistantId: string;
  model: string;
  temperature: number;
  instructions: string;
  status: AssistantStatus;
  createdAt: Date;
  updatedAt: Date;
}
