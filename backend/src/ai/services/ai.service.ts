import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeliciaMCPServer } from '../mcp/server';
import { DeliciaMCPPrompts } from '../mcp/prompts';
import { LlmClientService } from './llm-client.service';
import { ConversationHistoryService } from './conversation-history.service';
import { ConversationContext, AIResponse, ChatMessage, LLMConfig } from '../types';
import { ChatMessageDto } from '../dto/chat.dto';

@Injectable()
export class AiService implements OnModuleInit, OnModuleDestroy {
  private mcpServer: DeliciaMCPServer;
  private conversations: Map<string, ConversationContext> = new Map();
  private llmConfig: LLMConfig;

  constructor(
    private configService: ConfigService,
    private llmClientService: LlmClientService,
    private conversationHistoryService: ConversationHistoryService
  ) {
    this.mcpServer = new DeliciaMCPServer();
    
    // Configurar LLM (por ahora mock, más tarde se integrará con OpenAI/Anthropic)
    this.llmConfig = {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-latest',
      maxTokens: 2000,
      temperature: 0.7,
      systemPrompt: this.getSystemPrompt(),
    };
  }

  async onModuleInit() {
    try {
      console.log('🤖 Iniciando servicio de IA...');
      // TODO: Inicializar servidor MCP cuando esté listo para producción
      // await this.mcpServer.start();
      console.log('✅ Servicio de IA iniciado correctamente');
    } catch (error) {
      console.error('❌ Error iniciando servicio de IA:', error);
    }
  }

  async onModuleDestroy() {
    try {
      console.log('🛑 Deteniendo servicio de IA...');
      await this.mcpServer.stop();
      console.log('✅ Servicio de IA detenido correctamente');
    } catch (error) {
      console.error('❌ Error deteniendo servicio de IA:', error);
    }
  }

  /**
   * Procesar mensaje de chat del usuario
   */
  async processMessage(messageDto: ChatMessageDto): Promise<AIResponse> {
    try {
      const sessionId = messageDto.sessionId || this.generateSessionId();
      const userMessage = messageDto.message;

      // Obtener o crear contexto de conversación
      let context = this.conversations.get(sessionId);
      if (!context) {
        context = this.createNewContext(sessionId, messageDto.userId);
        this.conversations.set(sessionId, context);
      }

      // Actualizar última actividad
      context.lastActivity = new Date();

      // Crear mensaje del usuario para el historial
      const userChatMessage: ChatMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
        sessionId
      };

      // Añadir mensaje del usuario al historial
      this.conversationHistoryService.addMessage(sessionId, userChatMessage, context);

      // Procesar con cliente LLM real o mock
      const response = await this.llmClientService.processRequest({
        message: userMessage,
        context,
        temperature: this.llmConfig.temperature,
        maxTokens: this.llmConfig.maxTokens
      });

      // Crear mensaje del asistente para el historial
      const assistantChatMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        sessionId,
        action: response.action,
        metadata: {
          context: response.context
        }
      };

      // Actualizar contexto
      if (response.context) {
        Object.assign(context, response.context);
        this.conversations.set(sessionId, context);
      }

      // Añadir respuesta del asistente al historial
      this.conversationHistoryService.addMessage(sessionId, assistantChatMessage, context);

      return {
        message: response.message,
        action: response.action,
        data: response.data,
        context: {
          sessionId,
          currentStep: context.currentStep,
          cart: context.cart,
        },
      };
    } catch (error) {
      console.error('Error procesando mensaje:', error);
      throw new Error('Error procesando tu mensaje. Por favor intenta de nuevo.');
    }
  }

  /**
   * Obtener contexto de conversación
   */
  getConversationContext(sessionId: string): ConversationContext | undefined {
    return this.conversations.get(sessionId);
  }

  /**
   * Obtener historial completo de conversación
   */
  getConversationHistory(sessionId: string) {
    return this.conversationHistoryService.getConversationHistory(sessionId);
  }

  /**
   * Obtener estadísticas de conversación
   */
  getConversationStats(sessionId: string) {
    return this.conversationHistoryService.getConversationStats(sessionId);
  }

  /**
   * Buscar conversaciones
   */
  searchConversations(criteria: {
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    minMessages?: number;
    currentStep?: string;
  }) {
    return this.conversationHistoryService.searchConversations(criteria);
  }

  /**
   * Exportar conversación
   */
  exportConversation(sessionId: string) {
    return this.conversationHistoryService.exportConversation(sessionId);
  }

  /**
   * Obtener estadísticas globales
   */
  getGlobalStats() {
    return this.conversationHistoryService.getGlobalStats();
  }

  /**
   * Limpiar contextos antiguos (llamar periódicamente)
   */
  cleanupOldContexts(maxAgeHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    
    for (const [sessionId, context] of this.conversations.entries()) {
      if (context.lastActivity < cutoffTime) {
        this.conversations.delete(sessionId);
      }
    }
  }

  /**
   * Crear nuevo contexto de conversación
   */
  private createNewContext(sessionId: string, userId?: string): ConversationContext {
    return {
      sessionId,
      userId,
      currentStep: 'greeting',
      lastActivity: new Date(),
      cart: {
        items: [],
        totalItems: 0,
        totalAmount: 0,
        sessionId,
      },
      preferences: {
        language: 'es',
      },
    };
  }

  /**
   * Generar respuesta simulada (mock)
   * TODO: Reemplazar con llamada real a LLM + MCP
   */
  private async generateMockResponse(message: string, context: ConversationContext): Promise<AIResponse> {
    const lowerMessage = message.toLowerCase();
    const timeOfDay = this.getTimeOfDay();

    // Simular diferentes tipos de respuestas usando el sistema de prompts
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenas') || context.currentStep === 'greeting') {
      const promptName = context.userId ? 'greeting_vip' : 'greeting_standard';
      const prompt = DeliciaMCPPrompts.getPrompt(promptName);
      
      if (prompt) {
        const greeting = DeliciaMCPPrompts.generateContextualGreeting(timeOfDay);
        const question = DeliciaMCPPrompts.generateFollowUpQuestion({ 
          step: 'greeting', 
          timeOfDay, 
          hasCart: false, 
          cartItemCount: 0 
        });
        
        const responseMessage = DeliciaMCPPrompts.processTemplate(prompt.template, {
          greeting,
          question
        });
        
        return {
          message: responseMessage,
          context: { currentStep: 'browsing' },
        };
      }
      
      // Fallback si no hay prompt
      return {
        message: '¡Hola! 👋 Bienvenido a Delicia, tu restaurante dominicano favorito. ¿Te gustaría ver nuestro menú o necesitas ayuda con algo específico?',
        context: { currentStep: 'browsing' },
      };
    }

    if (lowerMessage.includes('menu') || lowerMessage.includes('menú') || lowerMessage.includes('comida')) {
      return {
        message: '🍽️ **Nuestro Menú Delicioso:**\n\n' +
                 '🍗 **Pollo Guisado** - RD$350\n' +
                 '   Delicioso pollo guisado al estilo dominicano\n' +
                 '   ⏱️ 15 min\n\n' +
                 '🍗 **Pollo al Horno** - RD$400\n' +
                 '   Pollo al horno con especias dominicanas\n' +
                 '   ⏱️ 20 min\n\n' +
                 '🥩 **Res Guisada** - RD$450\n' +
                 '   Carne de res guisada con vegetales frescos\n' +
                 '   ⏱️ 25 min\n\n' +
                 '¿Qué te llama la atención?',
        action: 'get_menu',
        context: { currentStep: 'browsing' },
      };
    }

    if (lowerMessage.includes('pollo')) {
      return {
        message: '¡Excelente elección! 🍗 Tenemos dos opciones deliciosas de pollo:\n\n' +
                 '• **Pollo Guisado** - RD$350 (15 min)\n' +
                 '• **Pollo al Horno** - RD$400 (20 min)\n\n' +
                 '¿Cuál prefieres? Solo dime "quiero el pollo guisado" o "pollo al horno"',
        context: { currentStep: 'ordering' },
      };
    }

    if (lowerMessage.includes('carrito') || lowerMessage.includes('pedido')) {
      const cartSummary = context.cart.items.length > 0 
        ? `🛒 **Tu Pedido:**\n${context.cart.items.map(item => `• ${item.quantity}x ${item.name} - RD$${item.subtotal}`).join('\n')}\n\n**Total: RD$${context.cart.totalAmount}**`
        : '🛒 Tu carrito está vacío. ¿Te gustaría ver nuestro menú?';
      
      return {
        message: cartSummary,
        action: 'get_cart_summary',
        context: { currentStep: 'confirming' },
      };
    }

    // Respuesta por defecto
    return {
      message: 'Te puedo ayudar con:\n\n' +
               '🍽️ Ver nuestro **menú**\n' +
               '🛒 Revisar tu **carrito**\n' +
               '📞 Hacer un **pedido**\n' +
               '❓ Responder **preguntas** sobre nuestros platos\n\n' +
               '¿En qué te puedo ayudar?',
      context: { currentStep: 'browsing' },
    };
  }

  /**
   * Prompt del sistema para el LLM
   */
  private getSystemPrompt(): string {
    return `Eres Clara, la asistente virtual del restaurante dominicano "Delicia". 

PERSONALIDAD:
- Amigable, cálida y servicial
- Conocedora de la cocina dominicana
- Usa emojis apropiados y un tono conversacional
- Hablas principalmente en español dominicano natural

CAPACIDADES:
- Mostrar el menú del restaurante
- Ayudar a elegir platos
- Gestionar el carrito de compras
- Procesar pedidos
- Responder preguntas sobre ingredientes y preparación

MENÚ ACTUAL:
1. Pollo Guisado - RD$350 (15 min)
2. Pollo al Horno - RD$400 (20 min) 
3. Res Guisada - RD$450 (25 min)
4. Pescado Frito - RD$500 (18 min)
5. Jugo de Chinola - RD$80 (5 min)
6. Flan de Coco - RD$120 (3 min)

INSTRUCCIONES:
- Siempre sé útil y positiva
- Si no entiendes algo, pide aclaración amablemente
- Sugiere platos populares cuando sea apropiado
- Confirma los pedidos antes de procesarlos
- Informa sobre tiempos de preparación`;
  }

  /**
   * Generar ID de sesión único
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtener hora del día para contexto
   */
  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 21) return 'evening';
    return 'night';
  }
} 