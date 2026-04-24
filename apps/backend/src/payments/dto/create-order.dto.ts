import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentMethod {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  CARD = 'card',
}

export class CreateOrderDto {
  @ApiProperty({ description: '支付金额', example: 9.99 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: '支付方式', enum: PaymentMethod, example: PaymentMethod.WECHAT })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: '小说ID', required: false })
  @IsOptional()
  @IsString()
  novelId?: string;

  @ApiProperty({ description: '章节ID', required: false })
  @IsOptional()
  @IsString()
  chapterId?: string;
}
