import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { KommoModule } from './kommo/kommo.module';

@Module({
  imports: [PrismaModule, UsersModule, KommoModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
