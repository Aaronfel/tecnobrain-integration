import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { KommoService } from './kommo.service';
import { KommoController } from './kommo.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [KommoController],
  providers: [KommoService],
})
export class KommoModule {}
