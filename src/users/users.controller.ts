import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create')
  async createUser(@Body() userData: { email: string; name?: string }) {
    return this.usersService.createUser(userData);
  }

  @Get('/all')
  async findAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Get('/:id')
  async findUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findUserById(id);
  }

  @Put('/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() userData: { email?: string; name?: string },
  ) {
    return this.usersService.updateUser(id, userData);
  }

  @Delete('/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}
