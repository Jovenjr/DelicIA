import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { DatabaseService } from '../database/database.service';
import { OrderStatus } from '../types/prisma.types';

interface DailyStats {
  date: string;
  ordersCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  completedOrders: number;
  cancelledOrders: number;
}

interface ProductStats {
  id: string;
  name: string;
  category: string;
  totalSold: number;
  totalRevenue: number;
  timesOrdered: number;
}

interface OrdersCountStats {
  pending: number;
  preparing: number;
  ready: number;
  completed: number;
  cancelled: number;
  total: number;
}

interface RevenueStats {
  totalRevenue: number;
  dailyAverage: number;
  monthlyRevenue: number;
  bestDay: {
    date: string;
    revenue: number;
  };
  periodComparison: {
    currentPeriod: number;
    previousPeriod: number;
    growthPercentage: number;
  };
}

@Injectable()
export class StatsService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Obtiene estadísticas de ventas del día
   */
  async getDailyStats(date?: string): Promise<DailyStats> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const cacheKey = `daily-stats-${targetDate}`;
    
    // Intentar obtener del cache (5 minutos)
    const cached = await this.cacheManager.get<DailyStats>(cacheKey);
    if (cached) {
      return cached;
    }

    const startDate = new Date(targetDate);
    const endDate = new Date(targetDate);
    endDate.setDate(endDate.getDate() + 1);

    const [ordersData, completedData, cancelledData] = await Promise.all([
      // Total de pedidos del día
      this.databaseService.order.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        _count: true,
        _sum: { total: true },
        _avg: { total: true },
      }),
      // Pedidos completados
      this.databaseService.order.count({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
          status: 'COMPLETED',
        },
      }),
      // Pedidos cancelados
      this.databaseService.order.count({
        where: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
          status: 'CANCELLED',
        },
      }),
    ]);

    const result: DailyStats = {
      date: targetDate,
      ordersCount: ordersData._count || 0,
      totalRevenue: Number(ordersData._sum.total) || 0,
      averageOrderValue: Number(ordersData._avg.total) || 0,
      completedOrders: completedData,
      cancelledOrders: cancelledData,
    };

    // Guardar en cache por 5 minutos
    await this.cacheManager.set(cacheKey, result, 300);
    
    return result;
  }

  /**
   * Obtiene productos más vendidos
   */
  async getTopProducts(limit: number = 10, days: number = 30): Promise<ProductStats[]> {
    const cacheKey = `top-products-${limit}-${days}`;
    
    // Intentar obtener del cache (15 minutos)
    const cached = await this.cacheManager.get<ProductStats[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.databaseService.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: {
            gte: startDate,
          },
          status: 'COMPLETED',
        },
      },
      _sum: {
        quantity: true,
        unitPrice: true,
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    // Obtener información detallada de los productos
    const productIds = result.map(item => item.productId);
    const products = await this.databaseService.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        category: {
          select: { name: true },
        },
      },
    });

    const productsMap = new Map(products.map(p => [p.id, p]));

         const stats: ProductStats[] = result.map(item => {
       const product = productsMap.get(item.productId);
       return {
         id: item.productId,
         name: (product as any)?.name || 'Producto no encontrado',
         category: (product as any)?.category?.name || 'Sin categoría',
         totalSold: item._sum.quantity || 0,
         totalRevenue: Number(item._sum.unitPrice) || 0,
         timesOrdered: item._count.productId || 0,
       };
     });

    // Guardar en cache por 15 minutos
    await this.cacheManager.set(cacheKey, stats, 900);
    
    return stats;
  }

  /**
   * Obtiene conteo de pedidos por estado
   */
  async getOrdersCountByStatus(): Promise<OrdersCountStats> {
    const cacheKey = 'orders-count-by-status';
    
    // Intentar obtener del cache (2 minutos)
    const cached = await this.cacheManager.get<OrdersCountStats>(cacheKey);
    if (cached) {
      return cached;
    }

    const [pending, preparing, ready, completed, cancelled, total] = await Promise.all([
      this.databaseService.order.count({ where: { status: 'PENDING' } }),
      this.databaseService.order.count({ where: { status: 'PREPARING' } }),
      this.databaseService.order.count({ where: { status: 'READY' } }),
      this.databaseService.order.count({ where: { status: 'COMPLETED' } }),
      this.databaseService.order.count({ where: { status: 'CANCELLED' } }),
      this.databaseService.order.count(),
    ]);

    const result: OrdersCountStats = {
      pending,
      preparing,
      ready,
      completed,
      cancelled,
      total,
    };

    // Guardar en cache por 2 minutos
    await this.cacheManager.set(cacheKey, result, 120);
    
    return result;
  }

  /**
   * Obtiene estadísticas de ingresos por período
   */
  async getRevenueStats(days: number = 30): Promise<RevenueStats> {
    const cacheKey = `revenue-stats-${days}`;
    
    // Intentar obtener del cache (10 minutos)
    const cached = await this.cacheManager.get<RevenueStats>(cacheKey);
    if (cached) {
      return cached;
    }

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);

    const [currentPeriodData, previousPeriodData, bestDayData] = await Promise.all([
      // Datos del período actual
      this.databaseService.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: 'COMPLETED',
        },
        _sum: { total: true },
        _count: true,
      }),
      // Datos del período anterior (para comparación)
      this.databaseService.order.aggregate({
        where: {
          createdAt: { 
            gte: prevStartDate,
            lt: startDate,
          },
          status: 'COMPLETED',
        },
        _sum: { total: true },
      }),
      // Mejor día del período
      this.databaseService.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          SUM(total) as revenue
        FROM orders 
        WHERE created_at >= ${startDate}
          AND status = 'COMPLETED'
        GROUP BY DATE(created_at)
        ORDER BY revenue DESC
        LIMIT 1
      `,
    ]);

    const currentRevenue = Number(currentPeriodData._sum.total) || 0;
    const previousRevenue = Number(previousPeriodData._sum.total) || 0;
    const dailyAverage = currentRevenue / days;
    
    // Calcular porcentaje de crecimiento
    let growthPercentage = 0;
    if (previousRevenue > 0) {
      growthPercentage = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    }

    // Datos del mejor día
    const bestDay = Array.isArray(bestDayData) && bestDayData.length > 0 
      ? {
          date: bestDayData[0].date,
          revenue: Number(bestDayData[0].revenue),
        }
      : {
          date: now.toISOString().split('T')[0],
          revenue: 0,
        };

    // Ingresos del mes actual
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyData = await this.databaseService.order.aggregate({
      where: {
        createdAt: { gte: currentMonth },
        status: 'COMPLETED',
      },
      _sum: { total: true },
    });

    const result: RevenueStats = {
      totalRevenue: currentRevenue,
      dailyAverage,
      monthlyRevenue: Number(monthlyData._sum.total) || 0,
      bestDay,
      periodComparison: {
        currentPeriod: currentRevenue,
        previousPeriod: previousRevenue,
        growthPercentage: Math.round(growthPercentage * 100) / 100,
      },
    };

    // Guardar en cache por 10 minutos
    await this.cacheManager.set(cacheKey, result, 600);
    
    return result;
  }

  /**
   * Limpia todos los caches de estadísticas
   */
  async clearStatsCache(): Promise<void> {
    // Note: En una implementación real, necesitarías un método para limpiar por patrón
    // Por ahora, limpiamos keys específicos
    const keys = [
      'orders-count-by-status',
      'top-products-10-30',
      'daily-stats-',
      'revenue-stats-30',
    ];
    
    for (const key of keys) {
      await this.cacheManager.del(key);
    }
  }
} 