import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  UseGuards,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseFilters } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { 
  JoinRoomDto, 
  OrderUpdateDto, 
  KitchenNotificationDto, 
  CashierNotificationDto,
  AdminNotificationDto 
} from './dto/websocket.dto';
import { WsAuthGuard } from './guards/ws-auth.guard';
import { WsRolesGuard } from './guards/ws-roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../types/prisma.types';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/',
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(OrdersGateway.name);

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Verificar autenticación durante la conexión
      const token = this.extractTokenFromHandshake(client);
      
      if (!token) {
        this.logger.warn(`Cliente desconectado: Token no proporcionado`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.data.user = payload;

      this.logger.log(`Cliente conectado: ${client.id} - Usuario: ${payload.username} (${payload.role})`);
      
      // Unir al usuario a una sala basada en su rol
      await this.joinRoleRoom(client, payload.role);

    } catch (error) {
      this.logger.warn(`Cliente desconectado: Token inválido - ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    this.logger.log(`Cliente desconectado: ${client.id} - Usuario: ${user?.username || 'Desconocido'}`);
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    return (
      client.handshake.auth?.token || 
      client.handshake.headers?.authorization?.replace('Bearer ', '') ||
      client.handshake.query?.token
    ) as string || null;
  }

  private async joinRoleRoom(client: Socket, role: UserRole) {
    switch (role) {
      case UserRole.ADMIN:
        await client.join('admin-room');
        await client.join('cashier-room');
        await client.join('kitchen-room');
        break;
      case UserRole.CASHIER:
        await client.join('cashier-room');
        break;
      case UserRole.COOK:
        await client.join('kitchen-room');
        break;
    }
  }

  // === EVENTOS PARA UNIRSE A SALAS DE PEDIDOS ===
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('join-order-room')
  async handleJoinOrderRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`order-${data.orderId}`);
    this.logger.log(`Cliente ${client.id} se unió a la sala del pedido ${data.orderId}`);
    
    client.emit('joined-order-room', {
      orderId: data.orderId,
      message: 'Conectado al seguimiento del pedido',
    });
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('leave-order-room')
  async handleLeaveOrderRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(`order-${data.orderId}`);
    this.logger.log(`Cliente ${client.id} abandonó la sala del pedido ${data.orderId}`);
  }

  // === EVENTOS PARA ACTUALIZACIONES DE PEDIDOS ===
  @UseGuards(WsAuthGuard, WsRolesGuard)
  @Roles(UserRole.COOK, UserRole.ADMIN)
  @SubscribeMessage('update-order-status')
  async handleOrderStatusUpdate(
    @MessageBody() data: OrderUpdateDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    this.logger.log(`Actualización de estado del pedido ${data.orderId} por ${user.username}: ${data.status}`);

    // Emitir a la sala específica del pedido
    this.server.to(`order-${data.orderId}`).emit('order-status-updated', {
      orderId: data.orderId,
      status: data.status,
      note: data.note,
      estimatedTime: data.estimatedTime,
      updatedBy: user.username,
      timestamp: new Date().toISOString(),
    });

    // Notificar a cajeros si el pedido está listo
    if (data.status === 'READY') {
      this.server.to('cashier-room').emit('order-ready-notification', {
        orderId: data.orderId,
        message: `Pedido ${data.orderId} listo para entrega`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // === EVENTOS PARA NOTIFICACIONES DE COCINA ===
  @UseGuards(WsAuthGuard, WsRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  @SubscribeMessage('notify-kitchen')
  async handleKitchenNotification(
    @MessageBody() data: KitchenNotificationDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    this.logger.log(`Notificación a cocina de ${user.username}: ${data.message}`);

    this.server.to('kitchen-room').emit('kitchen-notification', {
      ...data,
      from: user.username,
      timestamp: new Date().toISOString(),
    });
  }

  // === EVENTOS PARA NOTIFICACIONES DE CAJA ===
  @UseGuards(WsAuthGuard, WsRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COOK)
  @SubscribeMessage('notify-cashier')
  async handleCashierNotification(
    @MessageBody() data: CashierNotificationDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    this.logger.log(`Notificación a caja de ${user.username}: ${data.message}`);

    this.server.to('cashier-room').emit('cashier-notification', {
      ...data,
      from: user.username,
      timestamp: new Date().toISOString(),
    });
  }

  // === EVENTOS PARA NOTIFICACIONES DE ADMIN ===
  @UseGuards(WsAuthGuard, WsRolesGuard)
  @Roles(UserRole.ADMIN)
  @SubscribeMessage('notify-admin')
  async handleAdminNotification(
    @MessageBody() data: AdminNotificationDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    this.logger.log(`Notificación de admin de ${user.username}: ${data.message}`);

    this.server.to('admin-room').emit('admin-notification', {
      ...data,
      from: user.username,
      timestamp: new Date().toISOString(),
    });
  }

  // === MÉTODOS PÚBLICOS PARA EMITIR EVENTOS ===
  
  // Notificar nuevo pedido a cocina
  emitNewOrderToKitchen(orderId: string, orderData: any) {
    this.server.to('kitchen-room').emit('new-order', {
      orderId,
      ...orderData,
      timestamp: new Date().toISOString(),
    });
  }

  // Actualizar estadísticas en tiempo real
  emitStatsUpdate(statsData: any) {
    this.server.to('admin-room').emit('stats-updated', {
      ...statsData,
      timestamp: new Date().toISOString(),
    });
  }

  // Notificar cambio de estado de pedido
  emitOrderUpdate(orderId: string, status: string, data?: any) {
    this.server.to(`order-${orderId}`).emit('order-updated', {
      orderId,
      status,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Emergencia/Alerta general
  emitEmergencyAlert(message: string, data?: any) {
    this.server.emit('emergency-alert', {
      message,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
} 