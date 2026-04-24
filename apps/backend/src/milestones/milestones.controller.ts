import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MilestonesService } from './milestones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MilestoneResponseDto, MilestoneProgressResponseDto } from './dto/milestone-response.dto';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    [key: string]: any;
  };
}

@ApiTags('进化里程碑')
@Controller('milestones')
export class MilestonesController {
  constructor(private milestonesService: MilestonesService) {}

  @Get()
  @ApiOperation({ summary: '获取所有里程碑' })
  @ApiResponse({ status: 200, description: '获取成功', type: [MilestoneResponseDto] })
  async getAllMilestones(): Promise<MilestoneResponseDto[]> {
    return this.milestonesService.getAllMilestones();
  }

  @Get('my-progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户的里程碑进度' })
  @ApiResponse({ status: 200, description: '获取成功', type: [MilestoneProgressResponseDto] })
  async getMyProgress(@Request() req: RequestWithUser): Promise<MilestoneProgressResponseDto[]> {
    return this.milestonesService.getUserProgress(req.user.sub);
  }

  @Get(':clawId/progress')
  @ApiOperation({ summary: '获取指定用户的里程碑进度' })
  @ApiResponse({ status: 200, description: '获取成功', type: [MilestoneProgressResponseDto] })
  async getUserProgress(@Param('clawId') clawId: string): Promise<MilestoneProgressResponseDto[]> {
    return this.milestonesService.getUserProgressByClawId(clawId);
  }
}
