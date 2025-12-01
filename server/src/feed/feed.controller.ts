import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { Feed } from '../models/feed.model';
import {
  CreateFeedDto,
  UpdateFeedDto,
  FeedResponseDto,
  FeedDeleteResponseDto,
} from './dto';

@ApiTags('feeds')
@Controller('api/feeds')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all feeds',
    description: 'Retrieve all threat intelligence feeds configured in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of feeds retrieved successfully',
    type: [FeedResponseDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve feeds',
  })
  async getFeeds(): Promise<Feed[]> {
    return this.feedService.getFeeds();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get feed by ID',
    description: 'Retrieve a specific threat intelligence feed by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the feed',
    example: 'feed-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Feed retrieved successfully',
    type: FeedResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Feed not found',
  })
  async getFeed(@Param('id') id: string): Promise<Feed> {
    const feed = await this.feedService.getFeed(id);
    if (!feed) {
      throw new NotFoundException(`Feed with ID ${id} not found`);
    }
    return feed;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new feed',
    description: 'Configure a new threat intelligence feed source.',
  })
  @ApiBody({ type: CreateFeedDto })
  @ApiResponse({
    status: 201,
    description: 'Feed created successfully',
    type: FeedResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid feed data',
  })
  async createFeed(@Body() feedData: CreateFeedDto): Promise<Feed> {
    return this.feedService.createFeed(feedData);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a feed',
    description: 'Update an existing threat intelligence feed configuration.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the feed',
    example: 'feed-001',
  })
  @ApiBody({ type: UpdateFeedDto })
  @ApiResponse({
    status: 200,
    description: 'Feed updated successfully',
    type: FeedResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Feed not found',
  })
  async updateFeed(
    @Param('id') id: string,
    @Body() updates: UpdateFeedDto,
  ): Promise<Feed> {
    return this.feedService.updateFeed(id, updates);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a feed',
    description: 'Remove a threat intelligence feed from the system.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the feed',
    example: 'feed-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Feed deleted successfully',
    type: FeedDeleteResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Feed not found',
  })
  async deleteFeed(@Param('id') id: string): Promise<FeedDeleteResponseDto> {
    const deleted = await this.feedService.deleteFeed(id);
    return { deleted };
  }

  @Post(':id/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync a feed',
    description: 'Trigger a synchronization of the feed to pull the latest threat intelligence data.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the feed',
    example: 'feed-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Feed synced successfully',
    type: FeedResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Feed not found',
  })
  async syncFeed(@Param('id') id: string): Promise<Feed> {
    return this.feedService.syncFeed(id);
  }

  @Post(':id/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Toggle feed status',
    description: 'Toggle the status of a feed between ACTIVE and INACTIVE.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the feed',
    example: 'feed-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Feed status toggled successfully',
    type: FeedResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Feed not found',
  })
  async toggleFeedStatus(@Param('id') id: string): Promise<Feed> {
    return this.feedService.toggleFeedStatus(id);
  }
}
