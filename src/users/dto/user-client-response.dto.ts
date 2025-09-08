/**
 * DTO for user-client relationship response
 */
export class UserClientResponseDto {
  id: number;
  userId: number;
  clientId: number;
  permissions: string;
  assignedAt: Date;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  client?: {
    id: number;
    name: string;
    industry: string | null;
    status: string;
  };
}
