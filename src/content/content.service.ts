import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Content, ContentStatus } from '@prisma/client';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentResponseDto } from './dto/content-response.dto';

/**
 * Service for handling content operations
 */
@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates new content
   */
  async createContent(
    createContentDto: CreateContentDto,
  ): Promise<ContentResponseDto> {
    const { clientId, assistantId, type, parameters, status } =
      createContentDto;

    // Check if client exists
    const clientExists = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!clientExists) {
      throw new BadRequestException(`Client with ID ${clientId} not found`);
    }

    // Check if assistant exists and belongs to the client
    const assistant = await this.prisma.assistant.findUnique({
      where: { id: assistantId },
    });
    if (!assistant) {
      throw new BadRequestException(
        `Assistant with ID ${assistantId} not found`,
      );
    }
    if (assistant.clientId !== clientId) {
      throw new BadRequestException(
        `Assistant with ID ${assistantId} does not belong to client ${clientId}`,
      );
    }

    // Create content
    const content = await this.prisma.content.create({
      data: {
        clientId,
        assistantId,
        type,
        parameters,
        status,
      },
    });

    return this.mapToContentResponse(content);
  }

  /**
   * Finds all content
   */
  async findAllContent(): Promise<ContentResponseDto[]> {
    const content = await this.prisma.content.findMany({
      orderBy: { requestedAt: 'desc' },
    });

    return content.map((item) => this.mapToContentResponse(item));
  }

  /**
   * Finds content by client ID
   */
  async findContentByClientId(clientId: number): Promise<ContentResponseDto[]> {
    const content = await this.prisma.content.findMany({
      where: { clientId },
      orderBy: { requestedAt: 'desc' },
    });

    return content.map((item) => this.mapToContentResponse(item));
  }

  /**
   * Finds content by assistant ID
   */
  async findContentByAssistantId(
    assistantId: number,
  ): Promise<ContentResponseDto[]> {
    const content = await this.prisma.content.findMany({
      where: { assistantId },
      orderBy: { requestedAt: 'desc' },
    });

    return content.map((item) => this.mapToContentResponse(item));
  }

  /**
   * Finds content by type
   */
  async findContentByType(type: string): Promise<ContentResponseDto[]> {
    const content = await this.prisma.content.findMany({
      where: { type },
      orderBy: { requestedAt: 'desc' },
    });

    return content.map((item) => this.mapToContentResponse(item));
  }

  /**
   * Finds content by status
   */
  async findContentByStatus(
    status: ContentStatus,
  ): Promise<ContentResponseDto[]> {
    const content = await this.prisma.content.findMany({
      where: { status },
      orderBy: { requestedAt: 'desc' },
    });

    return content.map((item) => this.mapToContentResponse(item));
  }

  /**
   * Finds content by ID
   */
  async findContentById(id: number): Promise<ContentResponseDto> {
    const content = await this.prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    return this.mapToContentResponse(content);
  }

  /**
   * Updates content
   */
  async updateContent(
    id: number,
    updateContentDto: UpdateContentDto,
  ): Promise<ContentResponseDto> {
    const { clientId, assistantId, type, parameters, status } =
      updateContentDto;

    // Check if content exists
    const existingContent = await this.prisma.content.findUnique({
      where: { id },
    });
    if (!existingContent) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    // Check if client exists if clientId is being updated
    if (clientId && clientId !== existingContent.clientId) {
      const clientExists = await this.prisma.client.findUnique({
        where: { id: clientId },
      });
      if (!clientExists) {
        throw new BadRequestException(`Client with ID ${clientId} not found`);
      }
    }

    // Check if assistant exists and belongs to the client if assistantId is being updated
    if (assistantId && assistantId !== existingContent.assistantId) {
      const assistant = await this.prisma.assistant.findUnique({
        where: { id: assistantId },
      });
      if (!assistant) {
        throw new BadRequestException(
          `Assistant with ID ${assistantId} not found`,
        );
      }

      const finalClientId = clientId || existingContent.clientId;
      if (assistant.clientId !== finalClientId) {
        throw new BadRequestException(
          `Assistant with ID ${assistantId} does not belong to client ${finalClientId}`,
        );
      }
    }

    // Prepare update data with timestamps based on status
    const updateData: any = {
      clientId,
      assistantId,
      type,
      parameters,
      status,
    };

    // Update timestamps based on status changes
    if (status && status !== existingContent.status) {
      if (status === ContentStatus.IN_PROGRESS && !existingContent.startedAt) {
        updateData.startedAt = new Date();
      }
      if (
        (status === ContentStatus.COMPLETED ||
          status === ContentStatus.FAILED) &&
        !existingContent.completedAt
      ) {
        updateData.completedAt = new Date();
      }
    }

    // Update content
    const content = await this.prisma.content.update({
      where: { id },
      data: updateData,
    });

    return this.mapToContentResponse(content);
  }

  /**
   * Deletes content
   */
  async deleteContent(id: number): Promise<ContentResponseDto> {
    // Check if content exists
    const existingContent = await this.prisma.content.findUnique({
      where: { id },
    });
    if (!existingContent) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    // Delete content (cascade will handle related records)
    const content = await this.prisma.content.delete({
      where: { id },
    });

    return this.mapToContentResponse(content);
  }

  /**
   * Marks content as started
   */
  async startContent(id: number): Promise<ContentResponseDto> {
    const content = await this.prisma.content.update({
      where: { id },
      data: {
        status: ContentStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });

    return this.mapToContentResponse(content);
  }

  /**
   * Marks content as completed
   */
  async completeContent(id: number): Promise<ContentResponseDto> {
    const content = await this.prisma.content.update({
      where: { id },
      data: {
        status: ContentStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    return this.mapToContentResponse(content);
  }

  /**
   * Marks content as failed
   */
  async failContent(id: number): Promise<ContentResponseDto> {
    const content = await this.prisma.content.update({
      where: { id },
      data: {
        status: ContentStatus.FAILED,
        completedAt: new Date(),
      },
    });

    return this.mapToContentResponse(content);
  }

  /**
   * Maps a Content entity to ContentResponseDto
   */
  private mapToContentResponse(content: Content): ContentResponseDto {
    return {
      id: content.id,
      clientId: content.clientId,
      assistantId: content.assistantId,
      type: content.type,
      parameters: content.parameters as Record<string, any>,
      status: content.status,
      requestedAt: content.requestedAt,
      startedAt: content.startedAt,
      completedAt: content.completedAt,
    };
  }
}
