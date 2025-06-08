import { 
  Controller, 
  Get, 
  Query, 
  UseGuards, 
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../types/prisma.types';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * GET /stats/daily - Estadísticas de ventas del día
   * Query params: date (opcional, formato YYYY-MM-DD)
   */
  @Get('daily')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async getDailyStats(@Query('date') date?: string): Promise<any> {
    return this.statsService.getDailyStats(date);
  }

  /**
   * GET /stats/products - Productos más vendidos
   * Query params: limit (default: 10), days (default: 30)
   */
  @Get('products')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async getTopProducts(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ): Promise<any> {
    // Validar límites
    const validLimit = Math.min(Math.max(limit, 1), 50); // Entre 1 y 50
    const validDays = Math.min(Math.max(days, 1), 365); // Entre 1 y 365 días
    
    return this.statsService.getTopProducts(validLimit, validDays);
  }

  /**
   * GET /stats/orders-count - Conteo de pedidos por estado
   */
  @Get('orders-count')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.COOK)
  async getOrdersCountByStatus(): Promise<any> {
    return this.statsService.getOrdersCountByStatus();
  }

  /**
   * GET /stats/revenue - Estadísticas de ingresos por período
   * Query params: days (default: 30)
   */
  @Get('revenue')
  @Roles(UserRole.ADMIN)
  async getRevenueStats(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ): Promise<any> {
    // Validar el período
    const validDays = Math.min(Math.max(days, 1), 365); // Entre 1 y 365 días
    
    return this.statsService.getRevenueStats(validDays);
  }

  /**
   * GET /stats/summary - Resumen general del dashboard
   * Combina varias métricas en una sola respuesta
   */
  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async getDashboardSummary(): Promise<any> {
    const [dailyStats, ordersCount, topProducts] = await Promise.all([
      this.statsService.getDailyStats(),
      this.statsService.getOrdersCountByStatus(),
      this.statsService.getTopProducts(5, 7), // Top 5 productos de la semana
    ]);

    return {
      daily: dailyStats,
      ordersCount,
      topProducts,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * DELETE /stats/cache - Limpiar cache de estadísticas
   * Solo para administradores
   */
  @Delete('cache')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearStatsCache() {
    await this.statsService.clearStatsCache();
  }

  /**
   * GET /stats/health - Endpoint de salud para verificar la funcionalidad
   */
  @Get('health')
  @Roles(UserRole.ADMIN)
  async getStatsHealth() {
    try {
      // Ejecutar una consulta simple para verificar que todo funciona
      const ordersCount = await this.statsService.getOrdersCountByStatus();
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        totalOrders: ordersCount.total,
        cacheEnabled: true,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
} 