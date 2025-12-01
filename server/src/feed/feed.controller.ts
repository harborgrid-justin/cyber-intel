import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { Feed } from '../models/feed.model';

@ApiTags('feeds')
@Controller('api/feeds')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @ApiOperation({ summary: 'Get all feeds' })
  @ApiResponse({ status: 200, description: 'List of feeds' })
  getFeeds(): Promise<Feed[]> {
    return this.feedService.getFeeds();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feed by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Feed details' })
  @ApiResponse({ status: 404, description: 'Feed not found' })
  getFeed(@Param('id') id: string): Promise<Feed> {
    return this.feedService.getFeed(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new feed' })
  @ApiResponse({ status: 201, description: 'Feed created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createFeed(@Body() feedData: Partial<Feed>): Promise<Feed> {
    return this.feedService.createFeed(feedData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a feed' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Feed updated' })
  @ApiResponse({ status: 404, description: 'Feed not found' })
  updateFeed(@Param('id') id: string, @Body() updates: Partial<Feed>): Promise<Feed> {
    return this.feedService.updateFeed(id, updates);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a feed' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Feed deleted' })
  @ApiResponse({ status: 404, description: 'Feed not found' })
  async deleteFeed(@Param('id') id: string): Promise<{ deleted: boolean }> {
    const deleted = await this.feedService.deleteFeed(id);
    return { deleted };
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Sync a feed' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Feed synced' })
  @ApiResponse({ status: 404, description: 'Feed not found' })
  syncFeed(@Param('id') id: string): Promise<Feed> {
    return this.feedService.syncFeed(id);
  }

  @Post(':id/toggle')
  @ApiOperation({ summary: 'Toggle feed status' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Status toggled' })
  @ApiResponse({ status: 404, description: 'Feed not found' })
  toggleFeedStatus(@Param('id') id: string): Promise<Feed> {
    return this.feedService.toggleFeedStatus(id);
  }
}