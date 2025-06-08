import { Test, TestingModule } from '@nestjs/testing';
import { ConversationHistoryService } from './conversation-history.service';
import { ConversationContext, ChatMessage } from '../types';

describe('ConversationHistoryService', () => {
  let service: ConversationHistoryService;

  const mockContext: ConversationContext = {
    sessionId: 'test-session-1',
    userId: 'user-123',
    currentStep: 'browsing',
    lastActivity: new Date(),
    cart: {
      items: [],
      totalItems: 0,
      totalAmount: 0,
      sessionId: 'test-session-1'
    },
    preferences: {
      language: 'es'
    }
  };

  const mockMessage: ChatMessage = {
    role: 'user',
    content: 'Hola, quiero ver el menú',
    timestamp: new Date(),
    sessionId: 'test-session-1'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConversationHistoryService],
    }).compile();

    service = module.get<ConversationHistoryService>(ConversationHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addMessage', () => {
    it('should create new conversation history when session does not exist', () => {
      service.addMessage('new-session', mockMessage, mockContext);
      
      const history = service.getConversationHistory('new-session');
      expect(history).toBeDefined();
      expect(history?.sessionId).toBe('new-session');
      expect(history?.messages).toHaveLength(1);
      expect(history?.messages[0].content).toBe('Hola, quiero ver el menú');
    });

    it('should add message to existing conversation', () => {
      // Añadir primer mensaje
      service.addMessage('test-session-1', mockMessage, mockContext);
      
      // Añadir segundo mensaje
      const secondMessage: ChatMessage = {
        role: 'assistant',
        content: 'Aquí tienes nuestro menú',
        timestamp: new Date(),
        sessionId: 'test-session-1'
      };
      
      service.addMessage('test-session-1', secondMessage, mockContext);
      
      const history = service.getConversationHistory('test-session-1');
      expect(history?.messages).toHaveLength(2);
      expect(history?.messages[1].content).toBe('Aquí tienes nuestro menú');
    });

    it('should update metadata correctly', () => {
      service.addMessage('test-session-1', mockMessage, mockContext);
      
      const history = service.getConversationHistory('test-session-1');
      expect(history?.metadata?.totalMessages).toBe(1);
      expect(history?.metadata?.lastActivity).toBeDefined();
    });
  });

  describe('getConversationHistory', () => {
    it('should return null for non-existent session', () => {
      const history = service.getConversationHistory('non-existent');
      expect(history).toBeNull();
    });

    it('should return conversation history for existing session', () => {
      service.addMessage('test-session-1', mockMessage, mockContext);
      
      const history = service.getConversationHistory('test-session-1');
      expect(history).toBeDefined();
      expect(history?.sessionId).toBe('test-session-1');
    });
  });

  describe('getRecentMessages', () => {
    it('should return empty array for non-existent session', () => {
      const messages = service.getRecentMessages('non-existent');
      expect(messages).toEqual([]);
    });

    it('should return recent messages with limit', () => {
      // Añadir múltiples mensajes
      for (let i = 0; i < 15; i++) {
        const message: ChatMessage = {
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Mensaje ${i}`,
          timestamp: new Date(),
          sessionId: 'test-session-1'
        };
        service.addMessage('test-session-1', message, mockContext);
      }
      
      const recentMessages = service.getRecentMessages('test-session-1', 5);
      expect(recentMessages).toHaveLength(5);
      expect(recentMessages[4].content).toBe('Mensaje 14'); // Último mensaje
    });
  });

  describe('getConversationSummary', () => {
    it('should return null for empty conversation', () => {
      const summary = service.getConversationSummary('non-existent');
      expect(summary).toBeNull();
    });

    it('should return summary for existing conversation', () => {
      service.addMessage('test-session-1', mockMessage, mockContext);
      
      const summary = service.getConversationSummary('test-session-1');
      expect(summary).toContain('1 mensajes');
      expect(summary).toContain('browsing');
      expect(summary).toContain('0'); // cart items
    });
  });

  describe('getConversationStats', () => {
    it('should return null for non-existent session', () => {
      const stats = service.getConversationStats('non-existent');
      expect(stats).toBeNull();
    });

    it('should return correct stats for conversation', () => {
      // Añadir mensajes de usuario y asistente
      const userMessage: ChatMessage = {
        role: 'user',
        content: 'Mensaje de usuario',
        timestamp: new Date(),
        sessionId: 'test-session-1'
      };
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: 'Respuesta del asistente',
        timestamp: new Date(),
        sessionId: 'test-session-1'
      };
      
      service.addMessage('test-session-1', userMessage, mockContext);
      service.addMessage('test-session-1', assistantMessage, mockContext);
      
      const stats = service.getConversationStats('test-session-1');
      expect(stats).toBeDefined();
      expect(stats?.messageCount).toBe(2);
      expect(stats?.userMessages).toBe(1);
      expect(stats?.assistantMessages).toBe(1);
      expect(stats?.averageResponseLength).toBeGreaterThan(0);
    });
  });

  describe('searchConversations', () => {
    beforeEach(() => {
      // Crear conversaciones de prueba
      const context1 = { ...mockContext, userId: 'user-1', currentStep: 'greeting' as const };
      const context2 = { ...mockContext, sessionId: 'session-2', userId: 'user-2', currentStep: 'ordering' as const };
      
      service.addMessage('session-1', mockMessage, context1);
      service.addMessage('session-2', mockMessage, context2);
    });

    it('should filter by userId', () => {
      const results = service.searchConversations({ userId: 'user-1' });
      expect(results).toHaveLength(1);
      expect(results[0].sessionId).toBe('session-1');
    });

    it('should filter by currentStep', () => {
      const results = service.searchConversations({ currentStep: 'ordering' });
      expect(results).toHaveLength(1);
      expect(results[0].sessionId).toBe('session-2');
    });

    it('should filter by minimum messages', () => {
      // Añadir más mensajes a una sesión
      for (let i = 0; i < 5; i++) {
        service.addMessage('session-1', mockMessage, mockContext);
      }
      
      const results = service.searchConversations({ minMessages: 3 });
      expect(results).toHaveLength(1);
      expect(results[0].sessionId).toBe('session-1');
    });
  });

  describe('exportConversation', () => {
    it('should return null for non-existent session', () => {
      const exportData = service.exportConversation('non-existent');
      expect(exportData).toBeNull();
    });

    it('should export conversation correctly', () => {
      service.addMessage('test-session-1', mockMessage, mockContext);
      
      const exportData = service.exportConversation('test-session-1');
      expect(exportData).toBeDefined();
      expect(exportData?.export.sessionId).toBe('test-session-1');
      expect(exportData?.export.messageCount).toBe(1);
      expect(exportData?.export.messages).toHaveLength(1);
      expect(exportData?.export.finalContext.step).toBe('browsing');
    });
  });

  describe('deleteConversation', () => {
    it('should return false for non-existent session', () => {
      const deleted = service.deleteConversation('non-existent');
      expect(deleted).toBe(false);
    });

    it('should delete existing conversation', () => {
      service.addMessage('test-session-1', mockMessage, mockContext);
      
      const deleted = service.deleteConversation('test-session-1');
      expect(deleted).toBe(true);
      
      const history = service.getConversationHistory('test-session-1');
      expect(history).toBeNull();
    });
  });

  describe('getGlobalStats', () => {
    it('should return correct global statistics', () => {
      // Crear múltiples conversaciones
      service.addMessage('session-1', mockMessage, { ...mockContext, currentStep: 'greeting' });
      service.addMessage('session-2', mockMessage, { ...mockContext, currentStep: 'browsing' });
      service.addMessage('session-3', mockMessage, { ...mockContext, currentStep: 'greeting' });
      
      const stats = service.getGlobalStats();
      expect(stats.totalConversations).toBe(3);
      expect(stats.totalMessages).toBe(3);
      expect(stats.averageMessagesPerConversation).toBe(1);
      expect(stats.topSteps).toHaveLength(2);
      expect(stats.topSteps[0].step).toBe('greeting'); // Más frecuente
      expect(stats.topSteps[0].count).toBe(2);
    });
  });

  describe('hasConversation', () => {
    it('should return false for non-existent session', () => {
      const exists = service.hasConversation('non-existent');
      expect(exists).toBe(false);
    });

    it('should return true for existing session', () => {
      service.addMessage('test-session-1', mockMessage, mockContext);
      
      const exists = service.hasConversation('test-session-1');
      expect(exists).toBe(true);
    });
  });

  describe('getActiveSessions', () => {
    it('should return active sessions from last 24 hours', () => {
      service.addMessage('active-session', mockMessage, mockContext);
      
      const activeSessions = service.getActiveSessions();
      expect(activeSessions).toContain('active-session');
    });
  });
}); 