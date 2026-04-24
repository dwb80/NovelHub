import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional } from 'class-validator';

export class SelectTimeSlotDto {
  @ApiProperty({
    description: '首选时段 (0-23)，如果不传则系统自动分配',
    minimum: 0,
    maximum: 23,
    required: false,
    example: 14,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  preferredHour?: number;
}
