import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Assistant } from '@prisma/client';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { UpdateAssistantDto } from './dto/update-assistant.dto';
import { AssistantResponseDto } from './dto/assistant-response.dto';

/**
 * Service for handling assistant operations
 */
@Injectable()
export class AssistantsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new assistant
   */
  async createAssistant(
    createAssistantDto: CreateAssistantDto,
  ): Promise<AssistantResponseDto> {
    const {
      clientId,
      name,
      openaiAssistantId,
      model,
      temperature,
      instructions,
      status,
    } = createAssistantDto;

    // Check if client exists
    const clientExists = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!clientExists) {
      throw new BadRequestException(`Client with ID ${clientId} not found`);
    }

    // Check if assistant with same OpenAI ID already exists
    const existingAssistant = await this.prisma.assistant.findFirst({
      where: { openaiAssistantId },
    });
    if (existingAssistant) {
      throw new ConflictException(
        'Assistant with this OpenAI Assistant ID already exists',
      );
    }

    // Create assistant
    const assistant = await this.prisma.assistant.create({
      data: {
        clientId,
        name,
        openaiAssistantId,
        model,
        temperature,
        instructions,
        status,
      },
    });

    return this.mapToAssistantResponse(assistant);
  }

  /**
   * Finds all assistants
   */
  async findAllAssistants(): Promise<AssistantResponseDto[]> {
    const assistants = await this.prisma.assistant.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return assistants.map((assistant) =>
      this.mapToAssistantResponse(assistant),
    );
  }

  /**
   * Finds assistants by client ID
   */
  async findAssistantsByClientId(
    clientId: number,
  ): Promise<AssistantResponseDto[]> {
    const assistants = await this.prisma.assistant.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    return assistants.map((assistant) =>
      this.mapToAssistantResponse(assistant),
    );
  }

  /**
   * Finds an assistant by ID
   */
  async findAssistantById(id: number): Promise<AssistantResponseDto> {
    const assistant = await this.prisma.assistant.findUnique({
      where: { id },
    });

    if (!assistant) {
      throw new NotFoundException(`Assistant with ID ${id} not found`);
    }

    return this.mapToAssistantResponse(assistant);
  }

  /**
   * Updates an assistant
   */
  async updateAssistant(
    id: number,
    updateAssistantDto: UpdateAssistantDto,
  ): Promise<AssistantResponseDto> {
    const {
      clientId,
      name,
      openaiAssistantId,
      model,
      temperature,
      instructions,
      status,
    } = updateAssistantDto;

    // Check if assistant exists
    const existingAssistant = await this.prisma.assistant.findUnique({
      where: { id },
    });
    if (!existingAssistant) {
      throw new NotFoundException(`Assistant with ID ${id} not found`);
    }

    // Check if client exists if clientId is being updated
    if (clientId && clientId !== existingAssistant.clientId) {
      const clientExists = await this.prisma.client.findUnique({
        where: { id: clientId },
      });
      if (!clientExists) {
        throw new BadRequestException(`Client with ID ${clientId} not found`);
      }
    }

    // Check OpenAI Assistant ID uniqueness if it's being updated
    if (
      openaiAssistantId &&
      openaiAssistantId !== existingAssistant.openaiAssistantId
    ) {
      const assistantWithOpenAIId = await this.prisma.assistant.findFirst({
        where: { openaiAssistantId },
      });
      if (assistantWithOpenAIId) {
        throw new ConflictException(
          'Assistant with this OpenAI Assistant ID already exists',
        );
      }
    }

    // Update assistant
    const assistant = await this.prisma.assistant.update({
      where: { id },
      data: {
        clientId,
        name,
        openaiAssistantId,
        model,
        temperature,
        instructions,
        status,
      },
    });

    return this.mapToAssistantResponse(assistant);
  }

  /**
   * Deletes an assistant
   */
  async deleteAssistant(id: number): Promise<AssistantResponseDto> {
    // Check if assistant exists
    const existingAssistant = await this.prisma.assistant.findUnique({
      where: { id },
    });
    if (!existingAssistant) {
      throw new NotFoundException(`Assistant with ID ${id} not found`);
    }

    // Delete assistant (cascade will handle related records)
    const assistant = await this.prisma.assistant.delete({
      where: { id },
    });

    return this.mapToAssistantResponse(assistant);
  }

  /**
   * Maps an Assistant entity to AssistantResponseDto
   */
  private mapToAssistantResponse(assistant: Assistant): AssistantResponseDto {
    return {
      id: assistant.id,
      clientId: assistant.clientId,
      name: assistant.name,
      openaiAssistantId: assistant.openaiAssistantId,
      model: assistant.model,
      temperature: assistant.temperature,
      instructions: assistant.instructions,
      status: assistant.status,
      createdAt: assistant.createdAt,
      updatedAt: assistant.updatedAt,
    };
  }
}
