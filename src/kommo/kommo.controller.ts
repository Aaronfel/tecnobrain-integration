import { Controller, Post, Res, HttpStatus, Param } from '@nestjs/common';
import { KommoService } from './kommo.service';
// import { KommoWebhookDto } from './dto/kommo-message-received.dto';
import { Response } from 'express';
// import { CreateKommoDto } from './dto/create-kommo.dto';

@Controller('kommo')
export class KommoController {
  constructor(private readonly kommoService: KommoService) {}

  @Post('/webhook/:scope_id')
  processWebhook(
    @Param('scope_id') scopeId: string,
    // @Body() createKommoDto: KommoWebhookDto,
    @Res() res: Response,
  ) {
    console.log('scopeId', scopeId);
    return res.status(HttpStatus.OK).send('Webhook received');
    // return this.kommoService.processMessage(createKommoDto);
  }
}
