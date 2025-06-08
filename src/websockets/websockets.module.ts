import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OrdersGateway } from './orders.gateway';
import { WsAuthGuard } from './guards/ws-auth.guard';
import { WsRolesGuard } from './guards/ws-roles.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'delicia-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    AuthModule,
  ],
  providers: [
    OrdersGateway,
    WsAuthGuard,
    WsRolesGuard,
  ],
  exports: [OrdersGateway],
})
export class WebSocketsModule {} 