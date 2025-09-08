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
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { IntegrationResponseDto } from './dto/integration-response.dto';
import { Roles } from '../users/decorators/roles.decorator';
import { RolesGuard } from '../users/guards/roles.guard';
import { Public } from '../users/decorators/public.decorator';

/**
 * Controller for integration operations
 */
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  /**
   * Creates a new integration (Admin only)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createIntegration(
    @Body() createIntegrationDto: CreateIntegrationDto,
  ): Promise<IntegrationResponseDto> {
    return this.integrationsService.createIntegration(createIntegrationDto);
  }

  /**
   * Gets all integrations or filters by clientId or type if provided
   */
  @Get()
  async findAllIntegrations(
    @Query('clientId') clientId?: string,
    @Query('type') type?: string,
  ): Promise<IntegrationResponseDto[]> {
    if (clientId) {
      const clientIdNumber = parseInt(clientId, 10);
      if (isNaN(clientIdNumber)) {
        throw new Error('Invalid clientId parameter');
      }
      return this.integrationsService.findIntegrationsByClientId(
        clientIdNumber,
      );
    }
    if (type) {
      return this.integrationsService.findIntegrationsByType(type);
    }
    return this.integrationsService.findAllIntegrations();
  }

  /**
   * Gets an integration by ID
   */
  @Get(':id')
  async findIntegrationById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IntegrationResponseDto> {
    return this.integrationsService.findIntegrationById(id);
  }

  /**
   * Updates an integration by ID (Admin only)
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateIntegration(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateIntegrationDto: UpdateIntegrationDto,
  ): Promise<IntegrationResponseDto> {
    return this.integrationsService.updateIntegration(id, updateIntegrationDto);
  }

  /**
   * Deletes an integration by ID (Admin only)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteIntegration(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IntegrationResponseDto> {
    return this.integrationsService.deleteIntegration(id);
  }

  /**
   * Test endpoint for health check (Public route)
   */
  @Public()
  @Get('admin/test')
  async testEndpoint(): Promise<{ message: string; timestamp: string }> {
    return {
      message: 'Integrations module is working correctly',
      timestamp: new Date().toISOString(),
    };
  }
}
