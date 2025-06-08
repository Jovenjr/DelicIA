import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = `redis://${configService.get('REDIS_HOST', 'localhost')}:${configService.get('REDIS_PORT', 6379)}`;
        
        return {
          stores: [
            createKeyv(redisUrl)
          ],
          ttl: configService.get('CACHE_TTL', 300), // 5 minutos por defecto
          max: configService.get('CACHE_MAX_ITEMS', 1000), // máximo 1000 items
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class CustomCacheModule {} 