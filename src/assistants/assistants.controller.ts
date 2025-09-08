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
import { AssistantsService } from './assistants.service';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { UpdateAssistantDto } from './dto/update-assistant.dto';
import { AssistantResponseDto } from './dto/assistant-response.dto';
import { Roles } from '../users/decorators/roles.decorator';
import { RolesGuard } from '../users/guards/roles.guard';
import { Public } from '../users/decorators/public.decorator';

/**
 * Controller for assistant operations
 */
@Controller('assistants')
export class AssistantsController {
  constructor(private readonly assistantsService: AssistantsService) {}

  /**
   * Creates a new assistant (Admin only)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createAssistant(
    @Body() createAssistantDto: CreateAssistantDto,
  ): Promise<AssistantResponseDto> {
    return this.assistantsService.createAssistant(createAssistantDto);
  }

  /**
   * Gets all assistants or filters by clientId if provided
   */
  @Get()
  async findAllAssistants(
    @Query('clientId', ParseIntPipe) clientId?: number,
  ): Promise<AssistantResponseDto[]> {
    if (clientId) {
      return this.assistantsService.findAssistantsByClientId(clientId);
    }
    return this.assistantsService.findAllAssistants();
  }

  /**
   * Gets an assistant by ID
   */
  @Get(':id')
  async findAssistantById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AssistantResponseDto> {
    return this.assistantsService.findAssistantById(id);
  }

  /**
   * Updates an assistant by ID (Admin only)
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateAssistant(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssistantDto: UpdateAssistantDto,
  ): Promise<AssistantResponseDto> {
    return this.assistantsService.updateAssistant(id, updateAssistantDto);
  }

  /**
   * Deletes an assistant by ID (Admin only)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteAssistant(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AssistantResponseDto> {
    return this.assistantsService.deleteAssistant(id);
  }

  /**
   * Test endpoint for health check (Public route)
   */
  @Public()
  @Get('admin/test')
  async testEndpoint(): Promise<{ message: string; timestamp: string }> {
    return {
      message: 'Assistants module is working correctly',
      timestamp: new Date().toISOString(),
    };
  }
}
