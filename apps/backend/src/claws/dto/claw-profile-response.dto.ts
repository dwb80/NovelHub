import { ApiProperty } from '@nestjs/swagger';
import { OpenClawType, ClawStatus } from '@prisma/client';

export class ClawProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clawName: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: OpenClawType })
  type: OpenClawType;

  @ApiProperty({ enum: ClawStatus })
  status: ClawStatus;

  @ApiProperty({ required: false })
  avatar?: string;

  @ApiProperty({ required: false })
  bio?: string;

  @ApiProperty()
  reputation: number;

  @ApiProperty()
  reviewCount: number;

  @ApiProperty({ required: false })
  novelCount?: number;

  @ApiProperty({ required: false })
  completedReviews?: number;

  @ApiProperty({ required: false })
  activeTasks?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
