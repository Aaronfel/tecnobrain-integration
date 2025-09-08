import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { AssignClientToUserDto } from './dto/assign-client-to-user.dto';
import { UserClientResponseDto } from './dto/user-client-response.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

/**
 * Controller for user operations
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Creates a new user (Public route)
   */
  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.createUser(createUserDto);
  }

  /**
   * Authenticates a user and returns JWT token (Public route)
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<LoginResponseDto> {
    return this.usersService.loginUser(loginUserDto);
  }

  /**
   * Gets all users (Admin only)
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async findAllUsers(): Promise<UserResponseDto[]> {
    return this.usersService.findAllUsers();
  }

  /**
   * Gets a user by ID
   */
  @Get(':id')
  async findUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    return this.usersService.findUserById(id);
  }

  /**
   * Updates a user by ID
   */
  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  /**
   * Deletes a user by ID
   */
  @Delete(':id')
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    return this.usersService.deleteUser(id);
  }

  /**
   * Gets current user profile (Protected route)
   */
  @Get('me')
  async getCurrentUser(
    @CurrentUser() user: UserResponseDto,
  ): Promise<UserResponseDto> {
    return user;
  }

  /**
   * Assigns a client to a user (Admin only)
   */
  @Post('assign-client')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async assignClientToUser(
    @Body() assignClientToUserDto: AssignClientToUserDto,
  ): Promise<UserClientResponseDto> {
    return this.usersService.assignClientToUser(assignClientToUserDto);
  }

  /**
   * Gets all clients assigned to a specific user
   */
  @Get(':id/clients')
  async findUserClients(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<UserClientResponseDto[]> {
    return this.usersService.findUserClients(userId);
  }

  /**
   * Gets all users assigned to a specific client
   */
  @Get('client/:clientId')
  async findClientUsers(
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<UserClientResponseDto[]> {
    return this.usersService.findClientUsers(clientId);
  }

  /**
   * Updates user-client assignment permissions (Admin only)
   */
  @Put(':userId/client/:clientId/permissions')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateUserClientPermissions(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('clientId', ParseIntPipe) clientId: number,
    @Body() body: { permissions: string },
  ): Promise<UserClientResponseDto> {
    return this.usersService.updateUserClientPermissions(
      userId,
      clientId,
      body.permissions,
    );
  }

  /**
   * Removes a client from a user (Admin only)
   */
  @Delete(':userId/client/:clientId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async removeClientFromUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<UserClientResponseDto> {
    return this.usersService.removeClientFromUser(userId, clientId);
  }

  /**
   * Checks if a user has access to a client
   */
  @Get(':userId/client/:clientId/access')
  async checkUserAccessToClient(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<{ hasAccess: boolean }> {
    const hasAccess = await this.usersService.hasUserAccessToClient(
      userId,
      clientId,
    );
    return { hasAccess };
  }

  /**
   * Gets user permissions for a specific client
   */
  @Get(':userId/client/:clientId/permissions')
  async getUserPermissionsForClient(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<{ permissions: string | null }> {
    const permissions = await this.usersService.getUserPermissionsForClient(
      userId,
      clientId,
    );
    return { permissions };
  }

  /**
   * Test endpoint for health check (Public route)
   */
  @Public()
  @Get('admin/test')
  async testEndpoint(): Promise<{ message: string; timestamp: string }> {
    return {
      message: 'Users module is working correctly',
      timestamp: new Date().toISOString(),
    };
  }
}
