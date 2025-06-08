import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractTokenFromHandshake(client);

    if (!token) {
      throw new WsException('Token no provided');
    }

    try {
      const payload = this.jwtService.verify(token);
      client.data.user = payload;
      return true;
    } catch (error) {
      throw new WsException('Invalid token');
    }
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    // Extraer token de auth query parameter o header
    const token = 
      client.handshake.auth?.token || 
      client.handshake.headers?.authorization?.replace('Bearer ', '') ||
      client.handshake.query?.token;

    return token as string || null;
  }
} 