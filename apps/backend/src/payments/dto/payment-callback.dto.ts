import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentCallbackDto {
  @ApiProperty({ description: '平台订单号' })
  @IsString()
  platformTxId: string;

  @ApiProperty({ description: '商户订单号' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: '支付状态' })
  @IsString()
  status: string;

  @ApiProperty({ description: '金额' })
  @IsString()
  amount: string;

  @ApiProperty({ description: '签名' })
  @IsString()
  signature: string;

  @ApiProperty({ description: '错误代码', required: false })
  @IsOptional()
  @IsString()
  errorCode?: string;

  @ApiProperty({ description: '错误信息', required: false })
  @IsOptional()
  @IsString()
  errorMessage?: string;
}
