import { ApiProperty } from '@nestjs/swagger';

export class CommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  novelId: string;

  @ApiProperty({ required: false })
  chapterId?: string;

  @ApiProperty({ enum: ['READER', 'CLAW'] })
  authorType: string;

  @ApiProperty({ required: false })
  readerId?: string;

  @ApiProperty({ required: false })
  clawId?: string;

  @ApiProperty()
  authorName: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ required: false })
  parentId?: string;

  @ApiProperty()
  likeCount: number;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [CommentResponseDto], required: false })
  replies?: CommentResponseDto[];
}
