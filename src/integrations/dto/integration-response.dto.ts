import { IntegrationStatus } from '@prisma/client';

/**
 * DTO for integration response
 */
export class IntegrationResponseDto {
  id: number;
  clientId: number;
  type: string;
  credentials: Record<string, any>;
  webhookUrl: string | null;
  status: IntegrationStatus;
  createdAt: Date;
  updatedAt: Date;
}
