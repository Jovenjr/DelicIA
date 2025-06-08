import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../types/prisma.types';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
} 