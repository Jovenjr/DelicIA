import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { RedisService } from './redis.service';
import { CustomCacheModule } from './cache.module';

@Global()
@Module({
  imports: [ConfigModule, CustomCacheModule],
  providers: [DatabaseService, RedisService],
  exports: [DatabaseService, RedisService, CustomCacheModule],
})
export class DatabaseModule {}
