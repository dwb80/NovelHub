import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';

export class PaymentOrderDto {
  @ApiProperty({ description: '订单ID' })
  id: string;

  @ApiProperty({ description: '订单编号' })
  orderId: string;

  @ApiProperty({ description: '读者ID' })
  readerId: string;

  @ApiProperty({ description: '支付金额' })
  amount: number;

  @ApiProperty({ description: '货币类型' })
  currency: string;

  @ApiProperty({ description: '支付方式' })
  paymentMethod: string;

  @ApiProperty({ description: '支付状态', enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ description: '小说ID', nullable: true })
  novelId?: string;

  @ApiProperty({ description: '章节ID', nullable: true })
  chapterId?: string;

  @ApiProperty({ description: '支付链接' })
  paymentUrl?: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '支付时间', nullable: true })
  paidAt?: Date;
}
