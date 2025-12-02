import { PartialType } from '@nestjs/swagger';
import { MessagingCreateChannelDto } from './create-channel.dto';

export class MessagingUpdateChannelDto extends PartialType(MessagingCreateChannelDto) {}
