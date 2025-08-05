import { Controller, Post, Body, Query, Res, HttpStatus } from '@nestjs/common';
import { KommoService } from './kommo.service';
// import { KommoWebhookDto } from './dto/kommo-message-received.dto';
import { Response } from 'express';
// import { CreateKommoDto } from './dto/create-kommo.dto';

@Controller('kommo')
export class KommoController {
  constructor(private readonly kommoService: KommoService) {}

  @Post('/webhook')
  processWebhook(
    @Query('scope_id') scopeId: string,
    // @Body() createKommoDto: KommoWebhookDto,
    @Res() res: Response,
  ) {
    console.log('scopeId', scopeId);
    return res.status(HttpStatus.OK).send('Webhook received');
    // return this.kommoService.processMessage(createKommoDto);
  }
}
