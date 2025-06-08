import { IsString, IsUUID, IsNumber, IsEnum, IsOptional, IsObject } from 'class-validator';
import { OrderStatus } from '../../types/prisma.types';

export class JoinRoomDto {
  @IsUUID()
  orderId: string;
}

export class OrderUpdateDto {
  @IsUUID()
  orderId: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsNumber()
  estimatedTime?: number;
}

export class KitchenNotificationDto {
  @IsUUID()
  orderId: string;

  @IsString()
  message: string;

  @IsString()
  type: 'new_order' | 'priority' | 'cancelled';
}

export class CashierNotificationDto {
  @IsUUID()
  orderId: string;

  @IsString()
  message: string;

  @IsString()
  type: 'payment_received' | 'order_ready' | 'pickup';
}

export class AdminNotificationDto {
  @IsString()
  message: string;

  @IsString()
  type: 'stats_update' | 'system_alert' | 'order_alert';

  @IsOptional()
  @IsObject()
  data?: any;
} 