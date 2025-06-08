import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;
  private publisherClient: Redis;
  private subscriberClient: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // Cliente principal para operaciones generales
    this.redisClient = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
    });

    // Cliente dedicado para publicar mensajes (WebSockets)
    this.publisherClient = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
    });

    // Cliente dedicado para suscribirse a mensajes (WebSockets)
    this.subscriberClient = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
    });

    console.log('✅ Redis clients connected successfully');
  }

  async onModuleDestroy() {
    await Promise.all([
      this.redisClient?.quit(),
      this.publisherClient?.quit(),
      this.subscriberClient?.quit(),
    ]);
    console.log('✅ Redis clients disconnected');
  }

  // Getter para el cliente principal
  getClient(): Redis {
    return this.redisClient;
  }

  // Getters para clientes de Pub/Sub
  getPublisher(): Redis {
    return this.publisherClient;
  }

  getSubscriber(): Redis {
    return this.subscriberClient;
  }

  // Métodos de conveniencia para operaciones comunes
  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return this.redisClient.set(key, value, 'EX', ttl);
    }
    return this.redisClient.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  async setObject(key: string, value: object, ttl?: number): Promise<'OK'> {
    return this.set(key, JSON.stringify(value), ttl);
  }

  async getObject<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    return value ? JSON.parse(value) : null;
  }

  async exists(key: string): Promise<number> {
    return this.redisClient.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.redisClient.expire(key, seconds);
  }

  // Método para limpiar cache por patrón
  async deleteByPattern(pattern: string): Promise<number> {
    const keys = await this.redisClient.keys(pattern);
    if (keys.length === 0) return 0;
    return this.redisClient.del(...keys);
  }

  // Métodos para Pub/Sub (útiles para WebSockets)
  async publish(channel: string, message: string): Promise<number> {
    return this.publisherClient.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    await this.subscriberClient.subscribe(channel);
    this.subscriberClient.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        callback(message);
      }
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.subscriberClient.unsubscribe(channel);
  }
} 