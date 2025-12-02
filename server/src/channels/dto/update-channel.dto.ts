import { PartialType } from '@nestjs/swagger';
import { ChannelsCreateChannelDto } from './create-channel.dto';

export class ChannelsUpdateChannelDto extends PartialType(ChannelsCreateChannelDto) {}
