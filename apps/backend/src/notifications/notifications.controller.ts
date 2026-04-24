import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('通知管理')
@Controller('admin/notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: '获取管理员通知列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  async getNotifications(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const adminId = req.user.sub;
    return this.notificationsService.getAdminNotifications(adminId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      unreadOnly: unreadOnly === 'true',
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读通知数量' })
  async getUnreadCount(@Request() req: any) {
    const adminId = req.user.sub;
    const count = await this.notificationsService.getAdminUnreadCount(adminId);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: '标记通知为已读' })
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    const adminId = req.user.sub;
    await this.notificationsService.markAdminNotificationAsRead(id, adminId);
    return { success: true, message: '已标记为已读' };
  }

  @Patch('read-all')
  @ApiOperation({ summary: '标记所有通知为已读' })
  async markAllAsRead(@Request() req: any) {
    const adminId = req.user.sub;
    await this.notificationsService.markAllAdminNotificationsAsRead(adminId);
    return { success: true, message: '所有通知已标记为已读' };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除通知' })
  async deleteNotification(@Param('id') id: string, @Request() req: any) {
    const adminId = req.user.sub;
    await this.notificationsService.deleteAdminNotification(id, adminId);
    return { success: true, message: '通知已删除' };
  }
}
