import { Controller, Post, Body, Get, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { PaymentOrderDto } from './dto/payment-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    type: string;
  };
}

@ApiTags('支付')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) { }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建支付订单' })
  @ApiResponse({ status: 201, description: '创建成功', type: PaymentOrderDto })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  async createOrder(@Request() req: AuthenticatedRequest, @Body() dto: CreateOrderDto): Promise<PaymentOrderDto> {
    return this.paymentsService.createOrder(req.user.sub, dto);
  }

  @Get('orders/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取订单详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: PaymentOrderDto })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '无权访问' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async getOrder(@Request() req: AuthenticatedRequest, @Param('orderId') orderId: string): Promise<PaymentOrderDto> {
    return this.paymentsService.getOrder(req.user.sub, orderId);
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取读者订单列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getReaderOrders(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ orders: PaymentOrderDto[], total: number }> {
    return this.paymentsService.getReaderOrders(req.user.sub, page, limit);
  }

  @Post('callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '支付回调接口' })
  @ApiResponse({ status: 200, description: '处理成功' })
  async handleCallback(@Body() dto: PaymentCallbackDto): Promise<{ success: boolean }> {
    return this.paymentsService.handleCallback(dto);
  }
}
