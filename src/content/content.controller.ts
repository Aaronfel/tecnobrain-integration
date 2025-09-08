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
  Patch,
} from '@nestjs/common';
import { Role, ContentStatus } from '@prisma/client';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentResponseDto } from './dto/content-response.dto';
import { Roles } from '../users/decorators/roles.decorator';
import { RolesGuard } from '../users/guards/roles.guard';
import { Public } from '../users/decorators/public.decorator';

/**
 * Controller for content operations
 */
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  /**
   * Creates new content
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createContent(
    @Body() createContentDto: CreateContentDto,
  ): Promise<ContentResponseDto> {
    return this.contentService.createContent(createContentDto);
  }

  /**
   * Gets all content or filters by clientId, assistantId, type, or status if provided
   */
  @Get()
  async findAllContent(
    @Query('clientId') clientId?: string,
    @Query('assistantId') assistantId?: string,
    @Query('type') type?: string,
    @Query('status') status?: ContentStatus,
  ): Promise<ContentResponseDto[]> {
    if (clientId) {
      const clientIdNumber = parseInt(clientId, 10);
      if (isNaN(clientIdNumber)) {
        throw new Error('Invalid clientId parameter');
      }
      return this.contentService.findContentByClientId(clientIdNumber);
    }
    if (assistantId) {
      const assistantIdNumber = parseInt(assistantId, 10);
      if (isNaN(assistantIdNumber)) {
        throw new Error('Invalid assistantId parameter');
      }
      return this.contentService.findContentByAssistantId(assistantIdNumber);
    }
    if (type) {
      return this.contentService.findContentByType(type);
    }
    if (status) {
      return this.contentService.findContentByStatus(status);
    }
    return this.contentService.findAllContent();
  }

  /**
   * Gets content by ID
   */
  @Get(':id')
  async findContentById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ContentResponseDto> {
    return this.contentService.findContentById(id);
  }

  /**
   * Updates content by ID
   */
  @Put(':id')
  async updateContent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContentDto: UpdateContentDto,
  ): Promise<ContentResponseDto> {
    return this.contentService.updateContent(id, updateContentDto);
  }

  /**
   * Deletes content by ID (Admin only)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteContent(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ContentResponseDto> {
    return this.contentService.deleteContent(id);
  }

  /**
   * Marks content as started
   */
  @Patch(':id/start')
  async startContent(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ContentResponseDto> {
    return this.contentService.startContent(id);
  }

  /**
   * Marks content as completed
   */
  @Patch(':id/complete')
  async completeContent(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ContentResponseDto> {
    return this.contentService.completeContent(id);
  }

  /**
   * Marks content as failed
   */
  @Patch(':id/fail')
  async failContent(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ContentResponseDto> {
    return this.contentService.failContent(id);
  }

  /**
   * Test endpoint for health check (Public route)
   */
  @Public()
  @Get('admin/test')
  async testEndpoint(): Promise<{ message: string; timestamp: string }> {
    return {
      message: 'Content module is working correctly',
      timestamp: new Date().toISOString(),
    };
  }
}
