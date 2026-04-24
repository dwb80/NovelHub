import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class NotificationDto {
  @ApiProperty({ description: '通知ID' })
  id: string;

  @ApiProperty({ description: '通知类型', enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ description: '通知标题' })
  title: string;

  @ApiProperty({ description: '通知内容' })
  content: string;

  @ApiProperty({ description: '通知数据' })
  data?: any;

  @ApiProperty({ description: '是否已读' })
  isRead: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '阅读时间', nullable: true })
  readAt?: Date;
}
