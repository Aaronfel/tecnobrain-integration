import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { KommoWebhookDto } from './dto/kommo-message-received.dto';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class KommoService {
  private readonly logger = new Logger(KommoService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private makeSignature(body: string, secret: string): string {
    return crypto.createHmac('sha1', secret).update(body).digest('hex');
  }

  private makeContentMD5(body: string): string {
    return crypto.createHash('md5').update(body).digest('hex');
  }

  async processMessage(createKommoDto: KommoWebhookDto) {
    const messageAdd = createKommoDto.message.add[0];
    const conversationId = messageAdd.chat_id;
    const client = messageAdd.author;

    const timestampSec = Math.floor(Date.now() / 1000);
    const msecTimestamp = Date.now();
    const uniqueMsgId = `reply-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const botId = this.configService.get('KOMMO_BOT_ID');
    const channelSecret = this.configService.get('KOMMO_CHANNEL_SECRET');
    const scopeId = this.configService.get('KOMMO_SCOPE_ID');

    if (!botId || !channelSecret || !scopeId) {
      this.logger.error(
        'Missing Kommo configuration: botId, channelSecret, or scopeId',
      );
      return { success: false, reason: 'missing configuration' };
    }

    const payload = {
      event_type: 'new_message',
      payload: {
        timestamp: timestampSec,
        msec_timestamp: msecTimestamp,
        msgid: uniqueMsgId,
        conversation_id: conversationId,
        sender: {
          id: `bot-${botId}`, // arbitrary internal ID
          name: 'My Integration Bot',
          ref_id: botId, // required for bot identity
        },
        receiver: {
          id: client.id,
          name: client.name,
          avatar: client.avatar_url,
          // you can optionally include profile / profile_link if you have it
        },
        message: {
          type: 'text',
          text: 'Gracias por tu mensaje! ¿En qué puedo ayudarte?', // your reply text
        },
        silent: false,
      },
    };

    const bodyString = JSON.stringify(payload);

    const url = `https://amojo.kommo.com/v2/origin/custom/${scopeId}`;

    const headers = {
      'Content-Type': 'application/json',
      Date: new Date().toUTCString(),
      'Content-MD5': this.makeContentMD5(bodyString),
      'X-Signature': this.makeSignature(bodyString, channelSecret),
    };

    try {
      const response$ = this.httpService.post(url, bodyString, { headers });
      const response = await firstValueFrom(response$);
      this.logger.log(`Kommo reply sent, status ${response.status}`);
      return { success: true, data: response.data };
    } catch (err: any) {
      this.logger.error(
        'Failed to send Kommo reply',
        err.response?.data || err.message,
      );
      return { success: false, error: err.response?.data || err.message };
    }
  }
}
