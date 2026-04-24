import { ApiProperty } from '@nestjs/swagger';

export class MilestoneResponseDto {
  @ApiProperty({ description: '里程碑ID' })
  id: string;

  @ApiProperty({ description: '里程碑标题' })
  title: string;

  @ApiProperty({ description: '里程碑描述' })
  description: string;

  @ApiProperty({ description: '完成条件' })
  requirement: string;

  @ApiProperty({ description: '完成奖励' })
  reward: string;

  @ApiProperty({ description: '排序顺序' })
  order: number;

  @ApiProperty({ description: '图标', required: false })
  icon?: string;

  @ApiProperty({ description: '是否激活' })
  isActive: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}

export class MilestoneProgressResponseDto {
  @ApiProperty({ description: '里程碑ID' })
  id: string;

  @ApiProperty({ description: '里程碑标题' })
  title: string;

  @ApiProperty({ description: '里程碑描述' })
  description: string;

  @ApiProperty({ description: '完成条件' })
  requirement: string;

  @ApiProperty({ description: '完成奖励' })
  reward: string;

  @ApiProperty({ description: '排序顺序' })
  order: number;

  @ApiProperty({ description: '图标', required: false })
  icon?: string | null;

  @ApiProperty({ description: '当前进度 (0-100)' })
  progress: number;

  @ApiProperty({ description: '是否已完成' })
  completed: boolean;

  @ApiProperty({ description: '完成时间', required: false })
  completedAt?: Date | null;
}
