import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';
import { UsersModule } from './users/users.module';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';
import { StatsModule } from './stats/stats.module';
import { WebSocketsModule } from './websockets/websockets.module';

@Module({
  imports: [DatabaseModule, ConfigModule, AuthModule, AiModule, UsersModule, MenuModule, OrdersModule, StatsModule, WebSocketsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 