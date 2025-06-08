import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai.module';

describe('AI Module Integration Tests', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test'
        }),
        AiModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/ai/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/ai/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.service).toBe('ai-service');
          expect(res.body.message).toContain('funcionando correctamente');
        });
    });
  });

  describe('/ai/chat (POST)', () => {
    it('should process a greeting message', () => {
      return request(app.getHttpServer())
        .post('/ai/chat')
        .send({
          message: 'Hola, buenas tardes'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toContain('Bienvenido');
          expect(res.body.sessionId).toBeDefined();
          expect(res.body.context).toBeDefined();
        });
    });

    it('should process a menu request', () => {
      return request(app.getHttpServer())
        .post('/ai/chat')
        .send({
          message: 'Quiero ver el menú'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toContain('menú');
          expect(res.body.action).toBe('get_menu');
          expect(res.body.sessionId).toBeDefined();
        });
    });

    it('should handle invalid message format', () => {
      return request(app.getHttpServer())
        .post('/ai/chat')
        .send({
          // Missing message field
          sessionId: 'test-session'
        })
        .expect(400);
    });

    it('should maintain conversation context', async () => {
      // Primer mensaje
      const firstResponse = await request(app.getHttpServer())
        .post('/ai/chat')
        .send({
          message: 'Hola'
        })
        .expect(201);

      const sessionId = firstResponse.body.sessionId;

      // Segundo mensaje con la misma sesión
      return request(app.getHttpServer())
        .post('/ai/chat')
        .send({
          message: 'Quiero pollo',
          sessionId: sessionId
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.sessionId).toBe(sessionId);
          expect(res.body.message).toContain('pollo');
        });
    });
  });

  describe('/ai/context/:sessionId (GET)', () => {
    it('should return context for existing session', async () => {
      // Crear una sesión primero
      const chatResponse = await request(app.getHttpServer())
        .post('/ai/chat')
        .send({
          message: 'Hola'
        })
        .expect(201);

      const sessionId = chatResponse.body.sessionId;

      return request(app.getHttpServer())
        .get(`/ai/context/${sessionId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.sessionId).toBe(sessionId);
          expect(res.body.currentStep).toBeDefined();
          expect(res.body.cart).toBeDefined();
        });
    });

    it('should return 404 for non-existent session', () => {
      return request(app.getHttpServer())
        .get('/ai/context/non-existent-session')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Sesión no encontrada');
        });
    });
  });

  describe('/ai/history/:sessionId (GET)', () => {
    it('should return conversation history', async () => {
      // Crear conversación
      const chatResponse = await request(app.getHttpServer())
        .post('/ai/chat')
        .send({
          message: 'Hola, quiero el menú'
        })
        .expect(201);

      const sessionId = chatResponse.body.sessionId;

      // Añadir otro mensaje
      await request(app.getHttpServer())
        .post('/ai/chat')
        .send({
          message: 'Quiero pollo guisado',
          sessionId: sessionId
        })
        .expect(201);

      return request(app.getHttpServer())
        .get(`/ai/history/${sessionId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.sessionId).toBe(sessionId);
          expect(res.body.messages).toHaveLength(4); // 2 user + 2 assistant
          expect(res.body.metadata.totalMessages).toBe(4);
        });
    });

    it('should return 404 for non-existent history', () => {
      return request(app.getHttpServer())
        .get('/ai/history/non-existent-session')
        .expect(404);
    });
  });

  describe('/ai/stats/:sessionId (GET)', () => {
    it('should return conversation statistics', async () => {
      // Crear conversación con múltiples mensajes
      const chatResponse = await request(app.getHttpServer())
        .post('/ai/chat')
        .send({
          message: 'Hola'
        })
        .expect(201);

      const sessionId = chatResponse.body.sessionId;

      // Añadir más mensajes
      await request(app.getHttpServer())
        .post('/ai/chat')
        .send({
          message: 'Quiero ver el menú',
          sessionId: sessionId
        })
        .expect(201);

      return request(app.getHttpServer())
        .get(`/ai/stats/${sessionId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.messageCount).toBeGreaterThan(0);
          expect(res.body.userMessages).toBeGreaterThan(0);
          expect(res.body.assistantMessages).toBeGreaterThan(0);
          expect(res.body.duration).toBeGreaterThanOrEqual(0);
        });
    });
  });

  describe('/ai/search (GET)', () => {
    it('should search conversations without filters', async () => {
      // Crear algunas conversaciones
      await request(app.getHttpServer())
        .post('/ai/chat')
        .send({
          message: 'Hola'
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/ai/chat')
        .send({
          message: 'Buenos días'
        })
        .expect(201);

      return request(app.getHttpServer())
        .get('/ai/search')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should search conversations with filters', async () => {
      // Crear conversación con userId específico
      await request(app.getHttpServer())
        .post('/ai/chat')
        .send({
          message: 'Hola',
          userId: 'test-user-123'
        })
        .expect(201);

      return request(app.getHttpServer())
        .get('/ai/search?userId=test-user-123')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          // Debería encontrar al menos la conversación que creamos
        });
    });
  });

  describe('/ai/export/:sessionId (GET)', () => {
    it('should export conversation data', async () => {
      // Crear conversación
      const chatResponse = await request(app.getHttpServer())
        .post('/ai/chat')
        .send({
          message: 'Hola, quiero hacer un pedido'
        })
        .expect(201);

      const sessionId = chatResponse.body.sessionId;

      return request(app.getHttpServer())
        .get(`/ai/export/${sessionId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.sessionId).toBe(sessionId);
          expect(res.body.startTime).toBeDefined();
          expect(res.body.endTime).toBeDefined();
          expect(res.body.messageCount).toBeGreaterThan(0);
          expect(Array.isArray(res.body.messages)).toBe(true);
          expect(res.body.finalContext).toBeDefined();
        });
    });

    it('should return 404 for non-existent conversation', () => {
      return request(app.getHttpServer())
        .get('/ai/export/non-existent-session')
        .expect(404);
    });
  });

  describe('/ai/global-stats (GET)', () => {
    it('should return global statistics', async () => {
      // Crear algunas conversaciones
      await request(app.getHttpServer())
        .post('/ai/chat')
        .send({
          message: 'Hola'
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/ai/chat')
        .send({
          message: 'Buenos días'
        })
        .expect(201);

      return request(app.getHttpServer())
        .get('/ai/global-stats')
        .expect(200)
        .expect((res) => {
          expect(res.body.totalConversations).toBeGreaterThan(0);
          expect(res.body.activeConversations).toBeGreaterThan(0);
          expect(res.body.totalMessages).toBeGreaterThan(0);
          expect(res.body.averageMessagesPerConversation).toBeGreaterThan(0);
          expect(Array.isArray(res.body.topSteps)).toBe(true);
        });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON in chat request', () => {
      return request(app.getHttpServer())
        .post('/ai/chat')
        .send('invalid json')
        .expect(400);
    });

    it('should handle empty message in chat request', () => {
      return request(app.getHttpServer())
        .post('/ai/chat')
        .send({
          message: ''
        })
        .expect(400);
    });

    it('should handle very long messages gracefully', () => {
      const longMessage = 'A'.repeat(10000); // 10k characters
      
      return request(app.getHttpServer())
        .post('/ai/chat')
        .send({
          message: longMessage
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
          expect(res.body.sessionId).toBeDefined();
        });
    });
  });

  describe('Performance Tests', () => {
    it('should handle multiple concurrent requests', async () => {
      const promises = [];
      
      // Crear 10 requests concurrentes
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/ai/chat')
            .send({
              message: `Mensaje de prueba ${i}`
            })
            .expect(201)
        );
      }

      const responses = await Promise.all(promises);
      
      // Verificar que todas las respuestas son válidas
      responses.forEach((response) => {
        expect(response.body.message).toBeDefined();
        expect(response.body.sessionId).toBeDefined();
      });

      // Verificar que se crearon sesiones únicas
      const sessionIds = responses.map(r => r.body.sessionId);
      const uniqueSessionIds = new Set(sessionIds);
      expect(uniqueSessionIds.size).toBe(10);
    });

    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(app.getHttpServer())
        .post('/ai/chat')
        .send({
          message: 'Hola, quiero hacer un pedido'
        })
        .expect(201);

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Debería responder en menos de 5 segundos
      expect(responseTime).toBeLessThan(5000);
    });
  });
}); 