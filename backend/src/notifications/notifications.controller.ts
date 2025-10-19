import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of notifications to return (default: 50)' })
  @ApiQuery({ name: 'onlyUnread', required: false, description: 'Only return unread notifications' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved',
    schema: {
      example: [
        {
          id: '123',
          type: 'match',
          title: 'Yeni Eşleşme!',
          message: '%85 uyumla yeni bir eşleşmeniz var!',
          isRead: false,
          actionUrl: '/matches',
          createdAt: '2025-10-18T10:00:00Z',
        },
      ],
    },
  })
  async getNotifications(
    @Request() req,
    @Query('limit') limit?: number,
    @Query('onlyUnread') onlyUnread?: string | boolean,
  ) {
    return this.notificationsService.findByUser(
      req.user.id,
      limit ? parseInt(String(limit)) : 50,
      onlyUnread === 'true' || onlyUnread === true,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({
    status: 200,
    description: 'Unread count',
    schema: {
      example: { count: 5 },
    },
  })
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { message: 'All notifications marked as read' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.notificationsService.remove(id, req.user.id);
    return { message: 'Notification deleted' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('clear-read')
  @ApiOperation({ summary: 'Delete all read notifications' })
  @ApiResponse({ status: 200, description: 'Read notifications cleared' })
  async clearRead(@Request() req) {
    await this.notificationsService.clearRead(req.user.id);
    return { message: 'Read notifications cleared' };
  }
}

