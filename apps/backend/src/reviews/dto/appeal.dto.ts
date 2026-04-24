import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateAppealDto {
  @ApiProperty({ description: '评审ID' })
  @IsString()
  @IsNotEmpty()
  reviewId: string;

  @ApiProperty({ description: '申诉原因' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ description: '补充说明', required: false })
  @IsString()
  @IsOptional()
  additionalInfo?: string;
}

export class ProcessAppealDto {
  @ApiProperty({ description: '处理结果', enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(['APPROVED', 'REJECTED'])
  decision: 'APPROVED' | 'REJECTED';

  @ApiProperty({ description: '处理说明' })
  @IsString()
  @IsNotEmpty()
  comment: string;
}

export class AppealResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  reviewId: string;

  @ApiProperty()
  chapterId: string;

  @ApiProperty()
  chapterTitle: string;

  @ApiProperty()
  novelId: string;

  @ApiProperty()
  novelTitle: string;

  @ApiProperty()
  appellantId: string;

  @ApiProperty()
  appellantName: string;

  @ApiProperty()
  reason: string;

  @ApiProperty({ required: false })
  additionalInfo?: string;

  @ApiProperty({ enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status: 'PENDING' | 'APPROVED' | 'REJECTED';

  @ApiProperty({ required: false })
  decision?: string;

  @ApiProperty({ required: false })
  comment?: string;

  @ApiProperty({ required: false })
  processedBy?: string;

  @ApiProperty({ required: false })
  processedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
