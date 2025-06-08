import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '../types/prisma.types';

@Injectable()
export class OrdersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createOrderDto: CreateOrderDto, customerId?: string) {
    const { orderItems, total, notes } = createOrderDto;

    // Generar número de pedido único
    const orderNumber = await this.generateOrderNumber();

    // Verificar que todos los productos existan y estén disponibles
    for (const item of orderItems) {
      const product = await this.databaseService.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.isAvailable) {
        throw new BadRequestException(`Producto con ID ${item.productId} no está disponible`);
      }
    }

    // Crear el pedido en una transacción
    const order = await this.databaseService.$transaction(async (tx) => {
      // Crear el pedido
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          total,
          notes,
          customerId,
          status: OrderStatus.PENDING,
        },
      });

      // Crear los items del pedido
      await tx.orderItem.createMany({
        data: orderItems.map(item => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: item.notes,
        })),
      });

      return newOrder;
    });

    // Retornar el pedido con sus items
    return this.findOne(order.id);
  }

  async findAll(status?: OrderStatus, customerId?: string) {
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (customerId) {
      where.customerId = customerId;
    }

    return this.databaseService.order.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.databaseService.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return order;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, userRole?: string) {
    const { status } = updateOrderStatusDto;
    
    const order = await this.databaseService.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // Validar transiciones de estado según el rol
    this.validateStatusTransition(order.status, status, userRole);

    const updatedOrder = await this.databaseService.order.update({
      where: { id },
      data: { status },
      include: {
        customer: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return updatedOrder;
  }

  async markAsPaid(id: string) {
    const order = await this.databaseService.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (order.isPaid) {
      throw new BadRequestException('El pedido ya está marcado como pagado');
    }

    return this.databaseService.order.update({
      where: { id },
      data: { isPaid: true },
    });
  }

  async getStats() {
    const [totalOrders, pendingOrders, preparingOrders, completedOrders, totalRevenue] = await Promise.all([
      this.databaseService.order.count(),
      this.databaseService.order.count({ where: { status: OrderStatus.PENDING } }),
      this.databaseService.order.count({ where: { status: OrderStatus.PREPARING } }),
      this.databaseService.order.count({ where: { status: OrderStatus.COMPLETED } }),
      this.databaseService.order.aggregate({
        _sum: { total: true },
        where: { status: OrderStatus.COMPLETED },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      preparingOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.total || 0,
    };
  }

  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    const prefix = `${year}${month}${day}`;
    
    // Buscar el último pedido del día
    const lastOrder = await this.databaseService.order.findFirst({
      where: {
        orderNumber: {
          startsWith: prefix,
        },
      },
      orderBy: { orderNumber: 'desc' },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-3));
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(3, '0')}`;
  }

  private validateStatusTransition(currentStatus: any, newStatus: OrderStatus, userRole?: string) {
    const validTransitions: Record<string, string[]> = {
      'PENDING': ['PREPARING', 'CANCELLED'],
      'PREPARING': ['READY', 'CANCELLED'],
      'READY': ['COMPLETED'],
      'COMPLETED': [],
      'CANCELLED': [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(`No se puede cambiar de ${currentStatus} a ${newStatus}`);
    }

    // Validaciones específicas por rol
    if (newStatus === OrderStatus.CANCELLED && userRole !== 'ADMIN') {
      throw new ForbiddenException('Solo los administradores pueden cancelar pedidos');
    }
  }
}
