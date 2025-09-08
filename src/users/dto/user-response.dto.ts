import { Role } from '@prisma/client';

/**
 * DTO for user response (excludes sensitive data)
 */
export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
