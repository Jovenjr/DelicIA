import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { ConversationContext, AIResponse, LLMConfig } from '../types';
import { DeliciaMCPPrompts } from '../mcp/prompts';
import { DeliciaMCPTools } from '../mcp/tools';

export interface LLMRequest {
  message: string;
  context: ConversationContext;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

@Injectable()
export class LlmClientService {
  private readonly logger = new Logger(LlmClientService.name);
  private anthropicClient: Anthropic | null = null;
  private llmConfig: LLMConfig;

  constructor(private configService: ConfigService) {
    this.llmConfig = {
      provider: this.configService.get('LLM_PROVIDER', 'anthropic') as 'openai' | 'anthropic',
      model: this.configService.get('LLM_MODEL', 'claude-3-5-sonnet-latest'),
      maxTokens: this.configService.get('LLM_MAX_TOKENS', 2000),
      temperature: this.configService.get('LLM_TEMPERATURE', 0.7),
      systemPrompt: this.getSystemPrompt(),
    };

    this.initializeClients();
  }

  private initializeClients(): void {
    try {
      if (this.llmConfig.provider === 'anthropic') {
        const apiKey = this.configService.get('ANTHROPIC_API_KEY');
        if (apiKey) {
          this.anthropicClient = new Anthropic({
            apiKey,
            maxRetries: 3,
            timeout: 30000,
          });
          this.logger.log('Cliente Anthropic inicializado correctamente');
        } else {
          this.logger.warn('ANTHROPIC_API_KEY no encontrada, usando modo mock');
        }
      }
    } catch (error) {
      this.logger.error('Error inicializando clientes LLM:', error);
    }
  }

  /**
   * Procesar solicitud con LLM real o modo mock
   */
  async processRequest(request: LLMRequest): Promise<AIResponse> {
    try {
      if (this.anthropicClient && this.llmConfig.provider === 'anthropic') {
        return this.processWithAnthropic(request);
      } else {
        this.logger.debug('Usando modo mock - configurar ANTHROPIC_API_KEY para usar LLM real');
        return this.processMockRequest(request);
      }
    } catch (error) {
      this.logger.error('Error procesando solicitud LLM:', error);
      
      // Fallback a modo mock si hay error
      return this.processMockRequest(request);
    }
  }

  /**
   * Procesar con Claude de Anthropic
   */
  private async processWithAnthropic(request: LLMRequest): Promise<AIResponse> {
    const { message, context, systemPrompt, temperature, maxTokens } = request;

    try {
      // Construir historial de conversación
      const messages = this.buildConversationHistory(message, context);
      
      // Construir prompt del sistema con herramientas MCP
      const systemMessage = systemPrompt || this.buildSystemPromptWithTools(context);

      this.logger.debug('Enviando solicitud a Claude:', {
        model: this.llmConfig.model,
        messageCount: messages.length,
        systemPromptLength: systemMessage.length
      });

      const response = await this.anthropicClient!.messages.create({
        model: this.llmConfig.model,
        max_tokens: Number(maxTokens ?? this.llmConfig.maxTokens),
        temperature: Number(temperature ?? this.llmConfig.temperature),
        system: systemMessage,
        messages,
      });

      // Procesar respuesta
      const responseText = this.extractTextFromResponse(response);
      
      // Detectar acciones y herramientas
      const analysis = this.analyzeResponse(responseText, context);

      this.logger.debug('Respuesta de Claude procesada:', {
        length: responseText.length,
        detectedAction: analysis.action,
        usage: response.usage
      });

      return {
        message: analysis.processedMessage,
        action: analysis.action as any, // Temporal fix para type compatibility
        data: analysis.data,
        context: analysis.contextUpdate
      };

    } catch (error) {
      this.logger.error('Error en comunicación con Anthropic:', error);
      throw error;
    }
  }

  /**
   * Procesar solicitud en modo mock (para desarrollo/testing)
   */
  private async processMockRequest(request: LLMRequest): Promise<AIResponse> {
    const { message, context } = request;
    const lowerMessage = message.toLowerCase();
    const timeOfDay = this.getTimeOfDay();

    // Lógica de respuesta mock mejorada usando prompts
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
    }

    if (lowerMessage.includes('menu') || lowerMessage.includes('menú')) {
      const menuResult = await DeliciaMCPTools.getMenu({}, context.sessionId);
      const menuPrompt = DeliciaMCPPrompts.getPrompt('menu_presentation');
      
      if (menuPrompt && menuResult.content[0]) {
        const recommendation = DeliciaMCPPrompts.getTimeBasedRecommendation(timeOfDay);
        
        const responseMessage = DeliciaMCPPrompts.processTemplate(menuPrompt.template, {
          menu_content: menuResult.content[0].text,
          recommendation
        });
        
        return {
          message: responseMessage,
          action: 'get_menu',
          context: { currentStep: 'browsing' }
        };
      }
    }

    // Respuesta por defecto
    return {
      message: 'Te puedo ayudar con nuestro menú, pedidos y recomendaciones. ¿En qué te puedo ayudar?',
      context: { currentStep: 'browsing' }
    };
  }

  /**
   * Construir historial de conversación para LLM
   */
  private buildConversationHistory(currentMessage: string, context: ConversationContext): Anthropic.MessageParam[] {
    const messages: Anthropic.MessageParam[] = [];

    // Por ahora solo el mensaje actual
    // TODO: Implementar historial persistente
    messages.push({
      role: 'user',
      content: currentMessage
    });

    return messages;
  }

  /**
   * Construir prompt del sistema con información sobre herramientas MCP
   */
  private buildSystemPromptWithTools(context: ConversationContext): string {
    const basePrompt = this.getSystemPrompt();
    const timeOfDay = this.getTimeOfDay();
    
    const toolsDescription = `
HERRAMIENTAS DISPONIBLES:
Tienes acceso a las siguientes herramientas para ayudar a los clientes:

1. get_menu(category?: string) - Obtener menú completo o por categoría
2. find_item(name: string) - Buscar plato específico por nombre
3. get_item_details(id: number) - Obtener detalles de un item del menú
4. add_to_cart(itemId: number, quantity: number, notes?: string) - Añadir item al carrito
5. get_cart_summary() - Ver resumen del carrito actual
6. clear_cart() - Vaciar el carrito
7. confirm_order() - Confirmar y procesar el pedido

CONTEXTO ACTUAL:
- Hora del día: ${timeOfDay}
- Paso de conversación: ${context.currentStep}
- Items en carrito: ${context.cart.totalItems}
- Total del carrito: RD$${context.cart.totalAmount}

INSTRUCCIONES ESPECÍFICAS:
- Usa las herramientas cuando sea apropiado para completar las solicitudes del usuario
- Siempre confirma antes de añadir items al carrito
- Sé proactivo sugiriendo platos según la hora del día
- Mantén la personalidad dominicana cálida y amigable`;

    return `${basePrompt}\n\n${toolsDescription}`;
  }

  /**
   * Extraer texto de la respuesta de Anthropic
   */
  private extractTextFromResponse(response: Anthropic.Message): string {
    if (response.content && response.content.length > 0) {
      const firstContent = response.content[0];
      if (firstContent.type === 'text') {
        return firstContent.text;
      }
    }
    return 'Lo siento, no pude procesar tu solicitud correctamente.';
  }

  /**
   * Analizar respuesta para detectar acciones y herramientas
   */
  private analyzeResponse(responseText: string, context: ConversationContext): {
    processedMessage: string;
    action?: string;
    data?: any;
    contextUpdate?: Partial<ConversationContext>;
  } {
    const lower = responseText.toLowerCase();
    
    // Detectar intención de ver menú
    if (lower.includes('menú') || lower.includes('menu') || lower.includes('platos disponibles')) {
      return {
        processedMessage: responseText,
        action: 'get_menu',
        contextUpdate: { currentStep: 'browsing' }
      };
    }

    // Detectar intención de añadir al carrito
    if (lower.includes('añadir') || lower.includes('agregar') || lower.includes('quiero')) {
      return {
        processedMessage: responseText,
        action: 'add_to_cart',
        contextUpdate: { currentStep: 'ordering' }
      };
    }

    // Detectar intención de ver carrito
    if (lower.includes('carrito') || lower.includes('pedido actual') || lower.includes('resumen')) {
      return {
        processedMessage: responseText,
        action: 'get_cart_summary',
        contextUpdate: { currentStep: 'confirming' }
      };
    }

    return {
      processedMessage: responseText
    };
  }

  /**
   * Obtener prompt del sistema base
   */
  private getSystemPrompt(): string {
    return `Eres Clara, la asistente virtual del restaurante dominicano "Delicia". 

PERSONALIDAD:
- Amigable, cálida y servicial con personalidad dominicana auténtica
- Conocedora profunda de la cocina tradicional dominicana
- Usa emojis apropiados y expresiones naturales dominicanas
- Siempre positiva y dispuesta a ayudar

RESPONSABILIDADES:
- Ayudar a los clientes a explorar nuestro menú
- Hacer recomendaciones personalizadas según la hora y preferencias
- Gestionar carritos de compras y procesar pedidos
- Responder preguntas sobre ingredientes, preparación y tiempos
- Brindar una experiencia de servicio excepcional

MENÚ ACTUAL (RD$):
1. Pollo Guisado - $350 (15 min) - Delicioso pollo guisado al estilo dominicano
2. Pollo al Horno - $400 (20 min) - Con especias dominicanas y yuca hervida  
3. Res Guisada - $450 (25 min) - Con vegetales frescos y moro de guandules
4. Pescado Frito - $500 (18 min) - Con patacones y ensalada verde
5. Jugo de Chinola - $80 (5 min) - Refrescante maracuyá natural
6. Flan de Coco - $120 (3 min) - Postre tradicional con caramelo

PAUTAS:
- Siempre sé útil y busca maneras de hacer la experiencia especial
- Sugiere platos apropiados según la hora del día
- Confirma detalles importantes antes de procesar pedidos
- Si no sabes algo, pregunta amablemente o ofrece alternativas
- Mantén conversaciones naturales y no demasiado largas`;
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

  /**
   * Verificar si el servicio está configurado correctamente
   */
  isConfigured(): boolean {
    return this.anthropicClient !== null || this.configService.get('NODE_ENV') === 'development';
  }

  /**
   * Obtener información de configuración
   */
  getConfiguration(): LLMConfig {
    return { ...this.llmConfig };
  }
} 