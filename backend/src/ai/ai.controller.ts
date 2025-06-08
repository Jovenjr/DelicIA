import { Controller, Post, Body, Get, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { ChatMessageDto, ChatResponseDto } from './dto/chat.dto';
import { AIResponse } from './types';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Endpoint principal para chat con el asistente de IA
   * POST /ai/chat
   */
  @Post('chat')
  async chat(@Body() messageDto: ChatMessageDto): Promise<ChatResponseDto> {
    try {
      const response: AIResponse = await this.aiService.processMessage(messageDto);
      
      return {
        message: response.message,
        sessionId: response.context?.sessionId || 'unknown',
        action: response.action,
        data: response.data,
        context: response.context,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error procesando el mensaje',
          error: error instanceof Error ? error.message : 'Error desconocido',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtener contexto de conversación
   * GET /ai/context/:sessionId
   */
  @Get('context/:sessionId')
  async getContext(@Param('sessionId') sessionId: string) {
    try {
      const context = this.aiService.getConversationContext(sessionId);
      
      if (!context) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Sesión no encontrada',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        sessionId: context.sessionId,
        currentStep: context.currentStep,
        cart: context.cart,
        lastActivity: context.lastActivity,
        preferences: context.preferences,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error obteniendo contexto',
          error: error instanceof Error ? error.message : 'Error desconocido',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtener historial completo de conversación
   * GET /ai/history/:sessionId
   */
  @Get('history/:sessionId')
  async getHistory(@Param('sessionId') sessionId: string) {
    try {
      const history = this.aiService.getConversationHistory(sessionId);
      
      if (!history) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Historial no encontrado',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return history;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error obteniendo historial',
          error: error instanceof Error ? error.message : 'Error desconocido',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtener estadísticas de conversación
   * GET /ai/stats/:sessionId
   */
  @Get('stats/:sessionId')
  async getStats(@Param('sessionId') sessionId: string) {
    try {
      const stats = this.aiService.getConversationStats(sessionId);
      
      if (!stats) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Estadísticas no encontradas',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return stats;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error obteniendo estadísticas',
          error: error instanceof Error ? error.message : 'Error desconocido',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Buscar conversaciones
   * GET /ai/search
   */
  @Get('search')
  async searchConversations(
    @Query('userId') userId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('minMessages') minMessages?: string,
    @Query('currentStep') currentStep?: string,
  ) {
    try {
      const criteria: any = {};
      
      if (userId) criteria.userId = userId;
      if (dateFrom) criteria.dateFrom = new Date(dateFrom);
      if (dateTo) criteria.dateTo = new Date(dateTo);
      if (minMessages) criteria.minMessages = parseInt(minMessages);
      if (currentStep) criteria.currentStep = currentStep;

      const results = this.aiService.searchConversations(criteria);
      return results;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error buscando conversaciones',
          error: error instanceof Error ? error.message : 'Error desconocido',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Exportar conversación
   * GET /ai/export/:sessionId
   */
  @Get('export/:sessionId')
  async exportConversation(@Param('sessionId') sessionId: string) {
    try {
      const exportData = this.aiService.exportConversation(sessionId);
      
      if (!exportData) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Conversación no encontrada para exportar',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return exportData.export;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error exportando conversación',
          error: error instanceof Error ? error.message : 'Error desconocido',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtener estadísticas globales
   * GET /ai/global-stats
   */
  @Get('global-stats')
  async getGlobalStats() {
    try {
      const stats = this.aiService.getGlobalStats();
      return stats;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error obteniendo estadísticas globales',
          error: error instanceof Error ? error.message : 'Error desconocido',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Endpoint de salud para verificar que el servicio de IA funciona
   * GET /ai/health
   */
  @Get('health')
  async health() {
    return {
      status: 'ok',
      service: 'ai-service',
      timestamp: new Date().toISOString(),
      message: '🤖 Servicio de IA funcionando correctamente',
    };
  }
} 