import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminReaderService } from '../services/admin-reader.service';

interface RequestWithUser {
  user: {
    sub: string;
    type: string;
  };
}

@ApiTags('管理员-读者管理')
@Controller('admin/readers')
export class AdminReadersController {
  constructor(private adminReaderService: AdminReaderService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取读者列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'hasBoundClaw', required: false, type: Boolean })
  async getReaders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('hasBoundClaw') hasBoundClaw?: string,
  ) {
    return this.adminReaderService.getReaders({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
      search,
      hasBoundClaw: hasBoundClaw === 'true' ? true : hasBoundClaw === 'false' ? false : undefined,
    });
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新读者状态' })
  async updateReaderStatus(
    @Param('id') readerId: string,
    @Body('isBanned') isBanned: boolean,
    @Request() req: RequestWithUser,
  ) {
    const adminId = req.user.sub;
    return this.adminReaderService.updateReaderStatus(readerId, isBanned, adminId);
  }
}
