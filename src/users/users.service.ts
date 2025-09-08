import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { AssignClientToUserDto } from './dto/assign-client-to-user.dto';
import { UserClientResponseDto } from './dto/user-client-response.dto';

/**
 * Service for handling user operations
 */
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Creates a new user with encrypted password
   */
  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await this.authService.hashPassword(password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        email,
        passwordHash,
      },
    });

    return this.mapToUserResponse(user);
  }

  /**
   * Finds all users (excluding password hash)
   */
  async findAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      include: {
        userClients: {
          include: {
            client: true,
          },
        },
      },
    });

    return users.map((user) => this.mapToUserResponse(user));
  }

  /**
   * Finds a user by ID
   */
  async findUserById(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userClients: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapToUserResponse(user);
  }

  /**
   * Finds a user by email (includes password hash for authentication)
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Updates a user
   */
  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const { email, password, ...userData } = updateUserDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check email uniqueness if email is being updated
    if (email && email !== existingUser.email) {
      const userWithEmail = await this.findUserByEmail(email);
      if (userWithEmail) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Prepare update data
    const updateData: any = { ...userData };
    if (email) updateData.email = email;
    if (password) {
      updateData.passwordHash = await this.authService.hashPassword(password);
    }

    // Update user
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return this.mapToUserResponse(user);
  }

  /**
   * Deletes a user
   */
  async deleteUser(id: number): Promise<UserResponseDto> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Delete user (cascade will handle related records)
    const user = await this.prisma.user.delete({
      where: { id },
    });

    return this.mapToUserResponse(user);
  }

  /**
   * Authenticates a user and returns login response with JWT token
   */
  async loginUser(loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    const { email, password } = loginUserDto;

    // Find user by email
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    // Validate password
    await this.authService.validatePassword(password, user.passwordHash);

    // Create login response
    const userResponse = this.mapToUserResponse(user);
    return this.authService.createLoginResponse(userResponse);
  }

  /**
   * Assigns a client to a user
   */
  async assignClientToUser(
    assignClientToUserDto: AssignClientToUserDto,
  ): Promise<UserClientResponseDto> {
    const { userId, clientId, permissions } = assignClientToUserDto;

    // Check if user exists
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      throw new BadRequestException(`User with ID ${userId} not found`);
    }

    // Check if client exists
    const clientExists = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!clientExists) {
      throw new BadRequestException(`Client with ID ${clientId} not found`);
    }

    // Check if assignment already exists
    const existingAssignment = await this.prisma.userClient.findFirst({
      where: { userId, clientId },
    });
    if (existingAssignment) {
      throw new ConflictException(
        `User ${userId} is already assigned to client ${clientId}`,
      );
    }

    // Create assignment
    const userClient = await this.prisma.userClient.create({
      data: {
        userId,
        clientId,
        permissions,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            industry: true,
            status: true,
          },
        },
      },
    });

    return this.mapToUserClientResponse(userClient);
  }

  /**
   * Gets all clients assigned to a specific user
   */
  async findUserClients(userId: number): Promise<UserClientResponseDto[]> {
    const userClients = await this.prisma.userClient.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            industry: true,
            status: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return userClients.map((userClient) =>
      this.mapToUserClientResponse(userClient),
    );
  }

  /**
   * Gets all users assigned to a specific client
   */
  async findClientUsers(clientId: number): Promise<UserClientResponseDto[]> {
    const userClients = await this.prisma.userClient.findMany({
      where: { clientId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            industry: true,
            status: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return userClients.map((userClient) =>
      this.mapToUserClientResponse(userClient),
    );
  }

  /**
   * Updates user-client assignment permissions
   */
  async updateUserClientPermissions(
    userId: number,
    clientId: number,
    permissions: string,
  ): Promise<UserClientResponseDto> {
    // Find the assignment
    const existingAssignment = await this.prisma.userClient.findFirst({
      where: { userId, clientId },
    });
    if (!existingAssignment) {
      throw new NotFoundException(
        `User-Client assignment not found for user ${userId} and client ${clientId}`,
      );
    }

    // Update permissions
    const userClient = await this.prisma.userClient.update({
      where: { id: existingAssignment.id },
      data: { permissions },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            industry: true,
            status: true,
          },
        },
      },
    });

    return this.mapToUserClientResponse(userClient);
  }

  /**
   * Removes a client from a user
   */
  async removeClientFromUser(
    userId: number,
    clientId: number,
  ): Promise<UserClientResponseDto> {
    // Find and delete assignment
    const existingAssignment = await this.prisma.userClient.findFirst({
      where: { userId, clientId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            industry: true,
            status: true,
          },
        },
      },
    });

    if (!existingAssignment) {
      throw new NotFoundException(
        `User-Client assignment not found for user ${userId} and client ${clientId}`,
      );
    }

    await this.prisma.userClient.delete({
      where: { id: existingAssignment.id },
    });

    return this.mapToUserClientResponse(existingAssignment);
  }

  /**
   * Checks if a user has access to a client
   */
  async hasUserAccessToClient(
    userId: number,
    clientId: number,
  ): Promise<boolean> {
    const assignment = await this.prisma.userClient.findFirst({
      where: { userId, clientId },
    });

    return !!assignment;
  }

  /**
   * Gets user permissions for a specific client
   */
  async getUserPermissionsForClient(
    userId: number,
    clientId: number,
  ): Promise<string | null> {
    const assignment = await this.prisma.userClient.findFirst({
      where: { userId, clientId },
    });

    return assignment?.permissions || null;
  }

  /**
   * Maps a User entity to UserResponseDto (excludes sensitive data)
   */
  private mapToUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Maps a UserClient entity to UserClientResponseDto
   */
  private mapToUserClientResponse(userClient: any): UserClientResponseDto {
    return {
      id: userClient.id,
      userId: userClient.userId,
      clientId: userClient.clientId,
      permissions: userClient.permissions,
      assignedAt: userClient.assignedAt,
      user: userClient.user
        ? {
            id: userClient.user.id,
            name: userClient.user.name,
            email: userClient.user.email,
            role: userClient.user.role,
          }
        : undefined,
      client: userClient.client
        ? {
            id: userClient.client.id,
            name: userClient.client.name,
            industry: userClient.client.industry,
            status: userClient.client.status,
          }
        : undefined,
    };
  }
}
