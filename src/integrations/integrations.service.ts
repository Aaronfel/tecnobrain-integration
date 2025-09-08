import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Integration } from '@prisma/client';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { IntegrationResponseDto } from './dto/integration-response.dto';

/**
 * Service for handling integration operations
 */
@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new integration
   */
  async createIntegration(
    createIntegrationDto: CreateIntegrationDto,
  ): Promise<IntegrationResponseDto> {
    const { clientId, type, credentials, webhookUrl, status } =
      createIntegrationDto;

    // Check if client exists
    const clientExists = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!clientExists) {
      throw new BadRequestException(`Client with ID ${clientId} not found`);
    }

    // Check if integration of same type already exists for this client
    const existingIntegration = await this.prisma.integration.findFirst({
      where: { clientId, type },
    });
    if (existingIntegration) {
      throw new ConflictException(
        `Integration of type '${type}' already exists for this client`,
      );
    }

    // Create integration
    const integration = await this.prisma.integration.create({
      data: {
        clientId,
        type,
        credentials,
        webhookUrl,
        status,
      },
    });

    return this.mapToIntegrationResponse(integration);
  }

  /**
   * Finds all integrations
   */
  async findAllIntegrations(): Promise<IntegrationResponseDto[]> {
    const integrations = await this.prisma.integration.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return integrations.map((integration) =>
      this.mapToIntegrationResponse(integration),
    );
  }

  /**
   * Finds integrations by client ID
   */
  async findIntegrationsByClientId(
    clientId: number,
  ): Promise<IntegrationResponseDto[]> {
    const integrations = await this.prisma.integration.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    return integrations.map((integration) =>
      this.mapToIntegrationResponse(integration),
    );
  }

  /**
   * Finds integrations by type
   */
  async findIntegrationsByType(
    type: string,
  ): Promise<IntegrationResponseDto[]> {
    const integrations = await this.prisma.integration.findMany({
      where: { type },
      orderBy: { createdAt: 'desc' },
    });

    return integrations.map((integration) =>
      this.mapToIntegrationResponse(integration),
    );
  }

  /**
   * Finds an integration by ID
   */
  async findIntegrationById(id: number): Promise<IntegrationResponseDto> {
    const integration = await this.prisma.integration.findUnique({
      where: { id },
    });

    if (!integration) {
      throw new NotFoundException(`Integration with ID ${id} not found`);
    }

    return this.mapToIntegrationResponse(integration);
  }

  /**
   * Updates an integration
   */
  async updateIntegration(
    id: number,
    updateIntegrationDto: UpdateIntegrationDto,
  ): Promise<IntegrationResponseDto> {
    const { clientId, type, credentials, webhookUrl, status } =
      updateIntegrationDto;

    // Check if integration exists
    const existingIntegration = await this.prisma.integration.findUnique({
      where: { id },
    });
    if (!existingIntegration) {
      throw new NotFoundException(`Integration with ID ${id} not found`);
    }

    // Check if client exists if clientId is being updated
    if (clientId && clientId !== existingIntegration.clientId) {
      const clientExists = await this.prisma.client.findUnique({
        where: { id: clientId },
      });
      if (!clientExists) {
        throw new BadRequestException(`Client with ID ${clientId} not found`);
      }
    }

    // Check type uniqueness per client if type or clientId is being updated
    if (
      (type && type !== existingIntegration.type) ||
      (clientId && clientId !== existingIntegration.clientId)
    ) {
      const finalClientId = clientId || existingIntegration.clientId;
      const finalType = type || existingIntegration.type;

      const integrationWithType = await this.prisma.integration.findFirst({
        where: {
          clientId: finalClientId,
          type: finalType,
          NOT: { id },
        },
      });
      if (integrationWithType) {
        throw new ConflictException(
          `Integration of type '${finalType}' already exists for this client`,
        );
      }
    }

    // Update integration
    const integration = await this.prisma.integration.update({
      where: { id },
      data: {
        clientId,
        type,
        credentials,
        webhookUrl,
        status,
      },
    });

    return this.mapToIntegrationResponse(integration);
  }

  /**
   * Deletes an integration
   */
  async deleteIntegration(id: number): Promise<IntegrationResponseDto> {
    // Check if integration exists
    const existingIntegration = await this.prisma.integration.findUnique({
      where: { id },
    });
    if (!existingIntegration) {
      throw new NotFoundException(`Integration with ID ${id} not found`);
    }

    // Delete integration (cascade will handle related records)
    const integration = await this.prisma.integration.delete({
      where: { id },
    });

    return this.mapToIntegrationResponse(integration);
  }

  /**
   * Maps an Integration entity to IntegrationResponseDto
   */
  private mapToIntegrationResponse(
    integration: Integration,
  ): IntegrationResponseDto {
    return {
      id: integration.id,
      clientId: integration.clientId,
      type: integration.type,
      credentials: integration.credentials as Record<string, any>,
      webhookUrl: integration.webhookUrl,
      status: integration.status,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    };
  }
}
