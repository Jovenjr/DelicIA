import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './services/ai.service';
import { LlmClientService } from './services/llm-client.service';
import { ConversationHistoryService } from './services/conversation-history.service';

@Module({
  imports: [
    ConfigModule, // Para acceder a variables de entorno
  ],
  controllers: [AiController],
  providers: [AiService, LlmClientService, ConversationHistoryService],
  exports: [AiService], // Exportar para uso en otros módulos
})
export class AiModule {} 