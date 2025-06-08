import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { UserRole } from '../../types/prisma.types';

@Injectable()
export class WsRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const client: Socket = context.switchToWs().getClient();
    const user = client.data.user;

    if (!user || !user.role) {
      throw new WsException('Usuario no autenticado');
    }

    const hasRole = requiredRoles.includes(user.role);
    
    if (!hasRole) {
      throw new WsException('Permisos insuficientes para este namespace');
    }

    return true;
  }
} 