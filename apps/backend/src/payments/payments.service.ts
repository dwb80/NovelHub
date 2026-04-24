import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, PaymentMethod } from './dto/create-order.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { PaymentOrderDto } from './dto/payment-response.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) { }

  async createOrder(readerId: string, dto: CreateOrderDto): Promise<PaymentOrderDto> {
    if (dto.chapterId) {
      const chapter = await this.prisma.chapter.findUnique({
        where: { id: dto.chapterId, isDeleted: false },
      });

      if (!chapter) {
        throw new NotFoundException('章节不存在');
      }

      if (!chapter.isVip) {
        throw new BadRequestException('该章节无需付费');
      }

      const existingOrder = await this.prisma.paymentOrder.findFirst({
        where: {
          readerId,
          chapterId: dto.chapterId,
          status: PaymentStatus.PAID,
        },
      });

      if (existingOrder) {
        throw new BadRequestException('您已购买该章节');
      }
    }

    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const order = await this.prisma.paymentOrder.create({
      data: {
        orderId,
        orderNo: orderId,
        readerId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        novelId: dto.novelId,
        chapterId: dto.chapterId,
        status: PaymentStatus.PENDING,
      },
    });

    // Transaction model not defined in schema, skipping transaction record

    return this.mapToOrderDto(order, this.generatePaymentUrl(orderId, dto.paymentMethod));
  }

  async getOrder(readerId: string, orderId: string): Promise<PaymentOrderDto> {
    const order = await this.prisma.paymentOrder.findUnique({
      where: { orderId },
    });

    if (!order || order.isDeleted) {
      throw new NotFoundException('订单不存在');
    }

    if (order.readerId !== readerId) {
      throw new ForbiddenException('无权访问此订单');
    }

    return this.mapToOrderDto(order);
  }

  async getReaderOrders(readerId: string, page: number = 1, limit: number = 20): Promise<{ orders: PaymentOrderDto[], total: number }> {
    const [orders, total] = await Promise.all([
      this.prisma.paymentOrder.findMany({
        where: { readerId, isDeleted: false },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.paymentOrder.count({
        where: { readerId, isDeleted: false },
      }),
    ]);

    return {
      orders: orders.map(order => this.mapToOrderDto(order)),
      total,
    };
  }

  async handleCallback(dto: PaymentCallbackDto): Promise<{ success: boolean }> {
    const order = await this.prisma.paymentOrder.findUnique({
      where: { orderId: dto.orderId },
    });

    if (!order || order.isDeleted) {
      throw new NotFoundException('订单不存在');
    }

    const isSuccess = dto.status === 'SUCCESS';

    await this.prisma.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: isSuccess ? PaymentStatus.PAID : PaymentStatus.FAILED,
        paidAt: isSuccess ? new Date() : null,
      },
    });

    if (isSuccess && order.chapterId) {
      await this.prisma.chapter.update({
        where: { id: order.chapterId },
        data: { isLocked: false },
      });
    }

    return { success: true };
  }

  private mapToOrderDto(order: any, paymentUrl?: string): PaymentOrderDto {
    return {
      id: order.id,
      orderId: order.orderId,
      readerId: order.readerId,
      amount: order.amount.toNumber(),
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      status: order.status,
      novelId: order.novelId || undefined,
      chapterId: order.chapterId || undefined,
      paymentUrl,
      createdAt: order.createdAt,
      paidAt: order.paidAt || undefined,
    };
  }

  private generatePaymentUrl(orderId: string, method: PaymentMethod): string {
    const baseUrl = 'https://api.payment-gateway.example.com';
    switch (method) {
      case PaymentMethod.WECHAT:
        return `${baseUrl}/wechat/pay?order=${orderId}`;
      case PaymentMethod.ALIPAY:
        return `${baseUrl}/alipay/pay?order=${orderId}`;
      case PaymentMethod.CARD:
        return `${baseUrl}/card/pay?order=${orderId}`;
      default:
        return `${baseUrl}/pay?order=${orderId}`;
    }
  }
}
