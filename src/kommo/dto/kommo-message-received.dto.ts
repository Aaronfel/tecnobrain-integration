import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class KommoWebhookAuthorDto {
  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;
}

export class KommoWebhookMessageAddDto {
  @IsString()
  id: string;

  @IsString()
  chat_id: string;

  @IsString()
  talk_id: string;

  @IsString()
  contact_id: string;

  @IsString()
  text: string;

  @IsString()
  created_at: string;

  @IsString()
  element_type: string;

  @IsString()
  entity_type: string;

  @IsString()
  element_id: string;

  @IsString()
  entity_id: string;

  @IsString()
  type: string;

  @ValidateNested()
  @Type(() => KommoWebhookAuthorDto)
  author: KommoWebhookAuthorDto;

  @IsString()
  origin: string;
}

export class KommoWebhookAccountDto {
  @IsString()
  subdomain: string;

  @IsString()
  id: string;

  @IsObject()
  _links: {
    self: string;
  };
}

export class KommoWebhookMessageDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KommoWebhookMessageAddDto)
  add: KommoWebhookMessageAddDto[];
}

export class KommoWebhookDto {
  @ValidateNested()
  @Type(() => KommoWebhookAccountDto)
  account: KommoWebhookAccountDto;

  @ValidateNested()
  @Type(() => KommoWebhookMessageDto)
  message: KommoWebhookMessageDto;
}
