import { Injectable, Logger } from '@nestjs/common';
import { ConversationContext, ChatMessage } from '../types';

export interface ConversationHistory {
  sessionId: string;
  userId?: string;
  messages: ChatMessage[];
  context: ConversationContext;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    totalMessages: number;
    lastActivity: Date;
    averageResponseTime?: number;
    customerSatisfaction?: number;
  };
}

export interface MessageSummary {
  sessionId: string;
  messageCount: number;
  lastMessage: string;
  lastActivity: Date;
  currentStep: string;
  cartItems: number;
}

@Injectable()
export class ConversationHistoryService {
  private readonly logger = new Logger(ConversationHistoryService.name);
  
  // En memoria por ahora - en producción usar base de datos
  private conversations: Map<string, ConversationHistory> = new Map();
  private readonly MAX_MESSAGES_PER_SESSION = 100;
  private readonly CLEANUP_INTERVAL_HOURS = 24;

  constructor() {
    // Configurar limpieza automática cada 6 horas
    setInterval(() => {
      this.cleanupOldConversations();
    }, 6 * 60 * 60 * 1000);
  }

  /**
   * Obtener historial completo de una conversación
   */
  getConversationHistory(sessionId: string): ConversationHistory | null {
    const history = this.conversations.get(sessionId);
    if (!history) {
      this.logger.debug(`Historial no encontrado para sesión: ${sessionId}`);
      return null;
    }

    return {
      ...history,
      updatedAt: new Date() // Actualizar timestamp de acceso
    };
  }

  /**
   * Añadir mensaje al historial
   */
  addMessage(
    sessionId: string, 
    message: ChatMessage, 
    context: ConversationContext
  ): void {
    let history = this.conversations.get(sessionId);

    if (!history) {
      // Crear nuevo historial
      history = {
        sessionId,
        userId: context.userId,
        messages: [],
        context,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          totalMessages: 0,
          lastActivity: new Date()
        }
      };
      this.conversations.set(sessionId, history);
      this.logger.debug(`Nuevo historial creado para sesión: ${sessionId}`);
    }

    // Añadir mensaje
    history.messages.push(message);
    history.context = { ...context };
    history.updatedAt = new Date();
    
    // Actualizar metadata
    if (history.metadata) {
      history.metadata.totalMessages = history.messages.length;
      history.metadata.lastActivity = new Date();
    }

    // Limitar número de mensajes por sesión
    if (history.messages.length > this.MAX_MESSAGES_PER_SESSION) {
      const removedCount = history.messages.length - this.MAX_MESSAGES_PER_SESSION;
      history.messages = history.messages.slice(-this.MAX_MESSAGES_PER_SESSION);
      this.logger.debug(`Eliminados ${removedCount} mensajes antiguos de sesión: ${sessionId}`);
    }

    this.logger.debug(`Mensaje añadido a sesión ${sessionId}. Total: ${history.messages.length}`);
  }

  /**
   * Obtener mensajes recientes para contexto LLM
   */
  getRecentMessages(sessionId: string, limit: number = 10): ChatMessage[] {
    const history = this.conversations.get(sessionId);
    if (!history) {
      return [];
    }

    // Retornar los últimos N mensajes
    return history.messages.slice(-limit);
  }

  /**
   * Obtener resumen de conversación para contexto
   */
  getConversationSummary(sessionId: string): string | null {
    const history = this.conversations.get(sessionId);
    if (!history || history.messages.length === 0) {
      return null;
    }

    const messageCount = history.messages.length;
    const userMessages = history.messages.filter(m => m.role === 'user');
    const assistantMessages = history.messages.filter(m => m.role === 'assistant');
    
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';
    const currentStep = history.context.currentStep;
    const cartItems = history.context.cart.totalItems;

    return `Conversación activa con ${messageCount} mensajes. ` +
           `Último mensaje del usuario: "${lastUserMessage.substring(0, 100)}${lastUserMessage.length > 100 ? '...' : ''}". ` +
           `Estado actual: ${currentStep}. ` +
           `Items en carrito: ${cartItems}.`;
  }

  /**
   * Obtener estadísticas de conversación
   */
  getConversationStats(sessionId: string): {
    messageCount: number;
    duration: number; // en minutos
    userMessages: number;
    assistantMessages: number;
    averageResponseLength: number;
  } | null {
    const history = this.conversations.get(sessionId);
    if (!history) {
      return null;
    }

    const userMessages = history.messages.filter(m => m.role === 'user');
    const assistantMessages = history.messages.filter(m => m.role === 'assistant');
    
    const duration = Math.round(
      (history.updatedAt.getTime() - history.createdAt.getTime()) / (1000 * 60)
    );

    const averageResponseLength = assistantMessages.length > 0
      ? Math.round(
          assistantMessages.reduce((sum, msg) => sum + msg.content.length, 0) / assistantMessages.length
        )
      : 0;

    return {
      messageCount: history.messages.length,
      duration,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      averageResponseLength
    };
  }

  /**
   * Buscar conversaciones por criterios
   */
  searchConversations(criteria: {
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    minMessages?: number;
    currentStep?: string;
  }): MessageSummary[] {
    const results: MessageSummary[] = [];

    for (const [sessionId, history] of this.conversations.entries()) {
      // Filtrar por userId
      if (criteria.userId && history.userId !== criteria.userId) {
        continue;
      }

      // Filtrar por fecha
      if (criteria.dateFrom && history.createdAt < criteria.dateFrom) {
        continue;
      }
      if (criteria.dateTo && history.createdAt > criteria.dateTo) {
        continue;
      }

      // Filtrar por número mínimo de mensajes
      if (criteria.minMessages && history.messages.length < criteria.minMessages) {
        continue;
      }

      // Filtrar por paso actual
      if (criteria.currentStep && history.context.currentStep !== criteria.currentStep) {
        continue;
      }

      // Crear resumen
      const lastMessage = history.messages[history.messages.length - 1];
      results.push({
        sessionId,
        messageCount: history.messages.length,
        lastMessage: lastMessage ? lastMessage.content.substring(0, 100) : '',
        lastActivity: history.updatedAt,
        currentStep: history.context.currentStep,
        cartItems: history.context.cart.totalItems
      });
    }

    // Ordenar por última actividad (más reciente primero)
    return results.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  /**
   * Exportar historial de conversación
   */
  exportConversation(sessionId: string): {
    conversation: ConversationHistory;
    export: {
      sessionId: string;
      userId?: string;
      startTime: string;
      endTime: string;
      duration: string;
      messageCount: number;
      messages: Array<{
        timestamp: string;
        role: string;
        content: string;
        action?: string;
      }>;
      finalContext: {
        step: string;
        cartItems: number;
        totalAmount: number;
      };
    };
  } | null {
    const history = this.conversations.get(sessionId);
    if (!history) {
      return null;
    }

    const duration = Math.round(
      (history.updatedAt.getTime() - history.createdAt.getTime()) / (1000 * 60)
    );

    return {
      conversation: history,
      export: {
        sessionId,
        userId: history.userId,
        startTime: history.createdAt.toISOString(),
        endTime: history.updatedAt.toISOString(),
        duration: `${duration} minutos`,
        messageCount: history.messages.length,
        messages: history.messages.map(msg => ({
          timestamp: msg.timestamp?.toISOString() || new Date().toISOString(),
          role: msg.role,
          content: msg.content,
          action: msg.action
        })),
        finalContext: {
          step: history.context.currentStep,
          cartItems: history.context.cart.totalItems,
          totalAmount: history.context.cart.totalAmount
        }
      }
    };
  }

  /**
   * Eliminar conversación específica
   */
  deleteConversation(sessionId: string): boolean {
    const deleted = this.conversations.delete(sessionId);
    if (deleted) {
      this.logger.debug(`Conversación eliminada: ${sessionId}`);
    }
    return deleted;
  }

  /**
   * Limpiar conversaciones antiguas
   */
  cleanupOldConversations(): void {
    const cutoffTime = new Date(Date.now() - this.CLEANUP_INTERVAL_HOURS * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [sessionId, history] of this.conversations.entries()) {
      if (history.updatedAt < cutoffTime) {
        this.conversations.delete(sessionId);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      this.logger.log(`Limpieza automática: ${deletedCount} conversaciones antiguas eliminadas`);
    }
  }

  /**
   * Obtener estadísticas generales
   */
  getGlobalStats(): {
    totalConversations: number;
    activeConversations: number; // últimas 24h
    totalMessages: number;
    averageMessagesPerConversation: number;
    topSteps: Array<{ step: string; count: number }>;
  } {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    let totalMessages = 0;
    let activeConversations = 0;
    const stepCounts: Map<string, number> = new Map();

    for (const history of this.conversations.values()) {
      totalMessages += history.messages.length;
      
      if (history.updatedAt > last24h) {
        activeConversations++;
      }

      // Contar pasos
      const step = history.context.currentStep;
      stepCounts.set(step, (stepCounts.get(step) || 0) + 1);
    }

    // Ordenar pasos por frecuencia
    const topSteps = Array.from(stepCounts.entries())
      .map(([step, count]) => ({ step, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalConversations: this.conversations.size,
      activeConversations,
      totalMessages,
      averageMessagesPerConversation: this.conversations.size > 0 
        ? Math.round(totalMessages / this.conversations.size) 
        : 0,
      topSteps
    };
  }

  /**
   * Verificar si una sesión existe
   */
  hasConversation(sessionId: string): boolean {
    return this.conversations.has(sessionId);
  }

  /**
   * Obtener todas las sesiones activas
   */
  getActiveSessions(): string[] {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return Array.from(this.conversations.entries())
      .filter(([_, history]) => history.updatedAt > last24h)
      .map(([sessionId, _]) => sessionId);
  }
} 