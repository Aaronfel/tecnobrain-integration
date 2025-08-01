import { Controller, Post, Body } from '@nestjs/common';
import { KommoService } from './kommo.service';
import { KommoWebhookDto } from './dto/kommo-message-received.dto';
// import { CreateKommoDto } from './dto/create-kommo.dto';

@Controller('kommo')
export class KommoController {
  constructor(private readonly kommoService: KommoService) {}

  @Post('/webhook')
  processWebhook(@Body() createKommoDto: KommoWebhookDto) {
    return this.kommoService.processMessage(createKommoDto);
  }
}
