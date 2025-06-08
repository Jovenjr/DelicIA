import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { 
  DeliciaMCPTools,
  GetMenuSchema,
  FindItemSchema,
  GetItemDetailsSchema,
  AddToCartSchema,
  GetCartSummarySchema,
  ClearCartSchema,
  ConfirmOrderSchema
} from './tools.js';
import { DeliciaMCPPrompts, GetPromptSchema } from './prompts.js';

export class DeliciaMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'delicia-restaurant-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
        },
      }
    );
  }

  public async start(): Promise<void> {
    try {
      // Registrar handler para listar herramientas
      this.server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
          tools: [
            {
              name: 'get_menu',
              description: 'Obtiene el menú del restaurante, opcionalmente filtrado por categoría',
              inputSchema: GetMenuSchema,
            },
            {
              name: 'find_item',
              description: 'Busca un plato específico por nombre',
              inputSchema: FindItemSchema,
            },
            {
              name: 'get_item_details',
              description: 'Obtiene detalles completos de un item del menú por ID',
              inputSchema: GetItemDetailsSchema,
            },
            {
              name: 'add_to_cart',
              description: 'Añade un item al carrito de compras',
              inputSchema: AddToCartSchema,
            },
            {
              name: 'get_cart_summary',
              description: 'Obtiene el resumen del carrito actual',
              inputSchema: GetCartSummarySchema,
            },
            {
              name: 'clear_cart',
              description: 'Vacía el carrito de compras',
              inputSchema: ClearCartSchema,
            },
            {
              name: 'confirm_order',
              description: 'Confirma y procesa el pedido actual',
              inputSchema: ConfirmOrderSchema,
            },
          ],
        };
      });

      // Registrar handler para ejecutar herramientas
      this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        try {
          // Obtener sessionId de los argumentos o generar uno
          const sessionId = (args as any)?.sessionId || this.generateSessionId();

          switch (name) {
            case 'get_menu': {
              const validatedArgs = GetMenuSchema.parse(args);
              const result = await DeliciaMCPTools.getMenu(validatedArgs, sessionId);
              return { content: result.content };
            }

            case 'find_item': {
              const validatedArgs = FindItemSchema.parse(args);
              const result = await DeliciaMCPTools.findItem(validatedArgs);
              return { content: result.content };
            }

            case 'get_item_details': {
              const validatedArgs = GetItemDetailsSchema.parse(args);
              const result = await DeliciaMCPTools.getItemDetails(validatedArgs);
              return { content: result.content };
            }

            case 'add_to_cart': {
              const validatedArgs = AddToCartSchema.parse(args);
              const result = await DeliciaMCPTools.addToCart(validatedArgs, sessionId);
              return { content: result.content };
            }

            case 'get_cart_summary': {
              const result = await DeliciaMCPTools.getCartSummary(sessionId);
              return { content: result.content };
            }

            case 'clear_cart': {
              const result = await DeliciaMCPTools.clearCart(sessionId);
              return { content: result.content };
            }

            case 'confirm_order': {
              const result = await DeliciaMCPTools.confirmOrder(sessionId);
              return { content: result.content };
            }

            default:
              throw new McpError(
                ErrorCode.MethodNotFound,
                `Herramienta desconocida: ${name}`
              );
          }
        } catch (error) {
          if (error instanceof McpError) {
            throw error;
          }
          
          throw new McpError(
            ErrorCode.InternalError,
            `Error ejecutando herramienta ${name}: ${error instanceof Error ? error.message : 'Error desconocido'}`
          );
        }
      });

      // Registrar handler para listar prompts
      this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
        const prompts = DeliciaMCPPrompts.getAllPrompts();
        return {
          prompts: prompts.map(prompt => ({
            name: prompt.name,
            description: prompt.description,
            arguments: prompt.variables.map(variable => ({
              name: variable,
              description: `Variable ${variable} for prompt template`,
              required: true
            }))
          }))
        };
      });

      // Registrar handler para obtener prompt específico
      this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        try {
          const prompt = DeliciaMCPPrompts.getPrompt(name);
          
          if (!prompt) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Prompt no encontrado: ${name}`
            );
          }

          // Procesar template con argumentos proporcionados
          const processedTemplate = DeliciaMCPPrompts.processTemplate(prompt.template, args || {});

          return {
            description: prompt.description,
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: processedTemplate
                }
              }
            ]
          };
        } catch (error) {
          if (error instanceof McpError) {
            throw error;
          }
          
          throw new McpError(
            ErrorCode.InternalError,
            `Error obteniendo prompt ${name}: ${error instanceof Error ? error.message : 'Error desconocido'}`
          );
        }
      });

      // Configurar transporte (por ahora stdio para testing)
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      console.log('🤖 Servidor MCP de Delicia iniciado correctamente');
    } catch (error) {
      console.error('❌ Error iniciando servidor MCP:', error);
      throw error;
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public async stop(): Promise<void> {
    try {
      await this.server.close();
      console.log('🛑 Servidor MCP de Delicia detenido');
    } catch (error) {
      console.error('❌ Error deteniendo servidor MCP:', error);
    }
  }

  public getConfig() {
    return {
      name: 'delicia-restaurant-server',
      version: '1.0.0',
      capabilities: {
        tools: true,
        resources: false,
        prompts: true,
      },
    };
  }
}

// Exportar instancia singleton
export const deliciaMCPServer = new DeliciaMCPServer();

// Script para ejecutar el servidor directamente
if (require.main === module) {
  const server = new DeliciaMCPServer();
  
  // Manejar señales de cierre
  process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando servidor MCP...');
    await server.stop();
    process.exit(0);
  });

  // Iniciar servidor
  server.start().catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
} 