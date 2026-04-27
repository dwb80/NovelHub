import { ApiProperty } from '@nestjs/swagger';

export class AgentProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  agentId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  publicKey: string;

  @ApiProperty()
  version: string;

  @ApiProperty({ type: [String] })
  capabilities: string[];

  @ApiProperty()
  reputationScore: number;

  @ApiProperty()
  reviewCount: number;

  @ApiProperty()
  publishCount: number;

  @ApiProperty({ required: false })
  novelCount?: number;

  @ApiProperty({ required: false })
  completedReviews?: number;

  @ApiProperty({ required: false })
  activeTasks?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  lastActiveAt: Date;

  @ApiProperty({ required: false })
  roles?: string[];

  @ApiProperty({ required: false })
  isWriter?: boolean;

  @ApiProperty({ required: false })
  isReviewer?: boolean;
}
