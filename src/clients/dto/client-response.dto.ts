import { ClientStatus } from '@prisma/client';

/**
 * DTO for client response
 */
export class ClientResponseDto {
  id: number;
  name: string;
  industry: string | null;
  status: ClientStatus;
  createdAt: Date;
  updatedAt: Date;
}
