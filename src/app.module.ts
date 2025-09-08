import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { AssistantsModule } from './assistants/assistants.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { ContentModule } from './content/content.module';
import { KommoModule } from './kommo/kommo.module';
import { JwtAuthGuard } from './users/guards/jwt-auth.guard';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    ClientsModule,
    AssistantsModule,
    IntegrationsModule,
    ContentModule,
    KommoModule,
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
