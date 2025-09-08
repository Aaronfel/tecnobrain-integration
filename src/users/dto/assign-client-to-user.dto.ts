import { IsInt, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for assigning a client to a user
 */
export class AssignClientToUserDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  clientId: number;

  @IsString()
  @IsNotEmpty()
  permissions: string;
}
