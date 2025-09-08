import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from '@prisma/client';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientResponseDto } from './dto/client-response.dto';

/**
 * Service for handling client operations
 */
@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new client
   */
  async createClient(
    createClientDto: CreateClientDto,
  ): Promise<ClientResponseDto> {
    const { name, industry, status } = createClientDto;

    // Check if client with same name already exists
    const existingClient = await this.prisma.client.findFirst({
      where: { name },
    });
    if (existingClient) {
      throw new ConflictException('Client with this name already exists');
    }

    // Create client
    const client = await this.prisma.client.create({
      data: {
        name,
        industry,
        status,
      },
    });

    return this.mapToClientResponse(client);
  }

  /**
   * Finds all clients
   */
  async findAllClients(): Promise<ClientResponseDto[]> {
    const clients = await this.prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return clients.map((client) => this.mapToClientResponse(client));
  }

  /**
   * Finds a client by ID
   */
  async findClientById(id: number): Promise<ClientResponseDto> {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return this.mapToClientResponse(client);
  }

  /**
   * Updates a client
   */
  async updateClient(
    id: number,
    updateClientDto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    const { name, industry, status } = updateClientDto;

    // Check if client exists
    const existingClient = await this.prisma.client.findUnique({
      where: { id },
    });
    if (!existingClient) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    // Check name uniqueness if name is being updated
    if (name && name !== existingClient.name) {
      const clientWithName = await this.prisma.client.findFirst({
        where: { name },
      });
      if (clientWithName) {
        throw new ConflictException('Client with this name already exists');
      }
    }

    // Update client
    const client = await this.prisma.client.update({
      where: { id },
      data: {
        name,
        industry,
        status,
      },
    });

    return this.mapToClientResponse(client);
  }

  /**
   * Deletes a client
   */
  async deleteClient(id: number): Promise<ClientResponseDto> {
    // Check if client exists
    const existingClient = await this.prisma.client.findUnique({
      where: { id },
    });
    if (!existingClient) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    // Delete client (cascade will handle related records)
    const client = await this.prisma.client.delete({
      where: { id },
    });

    return this.mapToClientResponse(client);
  }

  /**
   * Maps a Client entity to ClientResponseDto
   */
  private mapToClientResponse(client: Client): ClientResponseDto {
    return {
      id: client.id,
      name: client.name,
      industry: client.industry,
      status: client.status,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}
