import { z } from 'zod';
import { MCPToolResult, MenuItem, CartItem } from '../types';

// Schemas de validación para las herramientas MCP
export const GetMenuSchema = z.object({
  category: z.string().optional().describe('Categoría del menú (ej: "pollo", "res", "bebidas", "postres")')
});

export const FindItemSchema = z.object({
  name: z.string().describe('Nombre del plato a buscar')
});

export const GetItemDetailsSchema = z.object({
  id: z.number().describe('ID del item del menú')
});

export const AddToCartSchema = z.object({
  itemId: z.number().describe('ID del item del menú'),
  quantity: z.number().min(1).describe('Cantidad del item'),
  notes: z.string().optional().describe('Notas especiales para el item')
});

export const GetCartSummarySchema = z.object({});

export const ClearCartSchema = z.object({});

export const CreateOrderSchema = z.object({
  items: z.array(z.object({
    itemId: z.number(),
    quantity: z.number(),
    notes: z.string().optional()
  })).describe('Items para el pedido')
});

export const ConfirmOrderSchema = z.object({});

// Clase para manejar las herramientas MCP
export class DeliciaMCPTools {
  private static menuData: MenuItem[] = [
    {
      id: 1,
      name: 'Pollo Guisado',
      description: 'Delicioso pollo guisado al estilo dominicano con arroz blanco y habichuelas rojas',
      price: 350,
      category: 'pollo',
      available: true,
      ingredients: ['pollo', 'cebolla', 'pimiento', 'ajo', 'tomate', 'cilantro'],
      preparationTime: 15
    },
    {
      id: 2,
      name: 'Pollo al Horno',
      description: 'Pollo al horno con especias dominicanas, acompañado de yuca hervida',
      price: 400,
      category: 'pollo',
      available: true,
      ingredients: ['pollo', 'oregano', 'ajo', 'limón', 'yuca'],
      preparationTime: 20
    },
    {
      id: 3,
      name: 'Res Guisada',
      description: 'Carne de res guisada con vegetales frescos y moro de guandules',
      price: 450,
      category: 'res',
      available: true,
      ingredients: ['res', 'cebolla', 'pimiento', 'zanahoria', 'guandules', 'arroz'],
      preparationTime: 25
    },
    {
      id: 4,
      name: 'Pescado Frito',
      description: 'Pescado fresco frito con patacones y ensalada verde',
      price: 500,
      category: 'pescado',
      available: true,
      ingredients: ['pescado', 'plátano verde', 'lechuga', 'tomate', 'cebolla'],
      preparationTime: 18
    },
    {
      id: 5,
      name: 'Jugo de Chinola',
      description: 'Refrescante jugo de maracuyá natural',
      price: 80,
      category: 'bebidas',
      available: true,
      preparationTime: 5
    },
    {
      id: 6,
      name: 'Flan de Coco',
      description: 'Postre tradicional dominicano de coco con caramelo',
      price: 120,
      category: 'postres',
      available: true,
      ingredients: ['coco', 'leche', 'huevos', 'azúcar'],
      preparationTime: 3
    }
  ];

  private static cart: Map<string, CartItem[]> = new Map();

  // Herramienta: Obtener menú
  static async getMenu(args: z.infer<typeof GetMenuSchema>, sessionId: string): Promise<MCPToolResult> {
    try {
      const { category } = args;
      
      let filteredMenu = this.menuData.filter(item => item.available);
      
      if (category) {
        filteredMenu = filteredMenu.filter(item => 
          item.category.toLowerCase().includes(category.toLowerCase())
        );
      }

      if (filteredMenu.length === 0) {
        return {
          content: [{
            type: 'text',
            text: category 
              ? `No encontramos platos en la categoría "${category}". ¿Te gustaría ver otras opciones?`
              : 'No hay platos disponibles en este momento.'
          }]
        };
      }

      const menuText = filteredMenu.map(item => 
        `🍽️ **${item.name}** - RD$${item.price}\n` +
        `   ${item.description}\n` +
        `   ⏱️ ${item.preparationTime} min\n`
      ).join('\n');

      return {
        content: [{
          type: 'text',
          text: category 
            ? `🍽️ **Menú de ${category}:**\n\n${menuText}`
            : `🍽️ **Nuestro Menú:**\n\n${menuText}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: 'Error al obtener el menú. Por favor intenta de nuevo.'
        }],
        isError: true
      };
    }
  }

  // Herramienta: Buscar item específico
  static async findItem(args: z.infer<typeof FindItemSchema>): Promise<MCPToolResult> {
    try {
      const { name } = args;
      
      const foundItems = this.menuData.filter(item => 
        item.available && 
        item.name.toLowerCase().includes(name.toLowerCase())
      );

      if (foundItems.length === 0) {
        return {
          content: [{
            type: 'text',
            text: `No encontré ningún plato con "${name}". ¿Podrías ser más específico o ver nuestro menú completo?`
          }]
        };
      }

      const itemsText = foundItems.map(item => 
        `🍽️ **${item.name}** - RD$${item.price}\n` +
        `   ${item.description}\n` +
        `   ⏱️ ${item.preparationTime} min\n` +
        `   ID: ${item.id}`
      ).join('\n\n');

      return {
        content: [{
          type: 'text',
          text: `Encontré estos platos con "${name}":\n\n${itemsText}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: 'Error al buscar el plato. Por favor intenta de nuevo.'
        }],
        isError: true
      };
    }
  }

  // Herramienta: Obtener detalles de un item
  static async getItemDetails(args: z.infer<typeof GetItemDetailsSchema>): Promise<MCPToolResult> {
    try {
      const { id } = args;
      
      const item = this.menuData.find(menuItem => menuItem.id === id && menuItem.available);

      if (!item) {
        return {
          content: [{
            type: 'text',
            text: `No encontré un plato con ID ${id}. ¿Podrías verificar el número?`
          }]
        };
      }

      const details = `🍽️ **${item.name}** - RD$${item.price}\n\n` +
        `📋 **Descripción:** ${item.description}\n\n` +
        `🧾 **Ingredientes:** ${item.ingredients?.join(', ') || 'No especificado'}\n\n` +
        `⏱️ **Tiempo de preparación:** ${item.preparationTime} minutos\n\n` +
        `📂 **Categoría:** ${item.category}`;

      return {
        content: [{
          type: 'text',
          text: details
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: 'Error al obtener los detalles del plato. Por favor intenta de nuevo.'
        }],
        isError: true
      };
    }
  }

  // Herramienta: Añadir al carrito
  static async addToCart(args: z.infer<typeof AddToCartSchema>, sessionId: string): Promise<MCPToolResult> {
    try {
      const { itemId, quantity, notes } = args;
      
      const item = this.menuData.find(menuItem => menuItem.id === itemId && menuItem.available);

      if (!item) {
        return {
          content: [{
            type: 'text',
            text: `No encontré un plato con ID ${itemId}. ¿Podrías verificar el número?`
          }],
          isError: true
        };
      }

      // Obtener carrito actual o crear uno nuevo
      const currentCart = this.cart.get(sessionId) || [];
      
      // Verificar si el item ya está en el carrito
      const existingItemIndex = currentCart.findIndex(cartItem => cartItem.itemId === itemId);
      
      if (existingItemIndex >= 0) {
        // Actualizar cantidad
        currentCart[existingItemIndex].quantity += quantity;
        currentCart[existingItemIndex].subtotal = currentCart[existingItemIndex].quantity * item.price;
        if (notes) {
          currentCart[existingItemIndex].notes = notes;
        }
      } else {
        // Añadir nuevo item
        const cartItem: CartItem = {
          itemId: item.id,
          name: item.name,
          quantity,
          price: item.price,
          notes,
          subtotal: quantity * item.price
        };
        currentCart.push(cartItem);
      }

      // Guardar carrito actualizado
      this.cart.set(sessionId, currentCart);

      const totalItems = currentCart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
      const totalAmount = currentCart.reduce((sum, cartItem) => sum + cartItem.subtotal, 0);

      return {
        content: [{
          type: 'text',
          text: `✅ ¡Perfecto! Añadí ${quantity} ${item.name} a tu pedido.\n\n` +
                `🛒 **Tu carrito:** ${totalItems} item(s) - RD$${totalAmount}\n\n` +
                `¿Deseas algo más o confirmamos el pedido?`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: 'Error al añadir el item al carrito. Por favor intenta de nuevo.'
        }],
        isError: true
      };
    }
  }

  // Herramienta: Ver resumen del carrito
  static async getCartSummary(sessionId: string): Promise<MCPToolResult> {
    try {
      const currentCart = this.cart.get(sessionId) || [];

      if (currentCart.length === 0) {
        return {
          content: [{
            type: 'text',
            text: '🛒 Tu carrito está vacío. ¿Te gustaría ver nuestro menú?'
          }]
        };
      }

      const cartText = currentCart.map(item => 
        `• ${item.quantity}x ${item.name} - RD$${item.subtotal}` +
        (item.notes ? `\n  📝 ${item.notes}` : '')
      ).join('\n');

      const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = currentCart.reduce((sum, item) => sum + item.subtotal, 0);

      return {
        content: [{
          type: 'text',
          text: `🛒 **Tu Pedido:**\n\n${cartText}\n\n` +
                `📊 **Resumen:**\n` +
                `• Total de items: ${totalItems}\n` +
                `• Total a pagar: RD$${totalAmount}\n\n` +
                `¿Deseas confirmar el pedido?`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: 'Error al obtener el resumen del carrito. Por favor intenta de nuevo.'
        }],
        isError: true
      };
    }
  }

  // Herramienta: Limpiar carrito
  static async clearCart(sessionId: string): Promise<MCPToolResult> {
    try {
      this.cart.delete(sessionId);

      return {
        content: [{
          type: 'text',
          text: '🗑️ Tu carrito ha sido vaciado. ¿Te gustaría hacer un nuevo pedido?'
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: 'Error al limpiar el carrito. Por favor intenta de nuevo.'
        }],
        isError: true
      };
    }
  }

  // Herramienta: Confirmar pedido
  static async confirmOrder(sessionId: string): Promise<MCPToolResult> {
    try {
      const currentCart = this.cart.get(sessionId) || [];

      if (currentCart.length === 0) {
        return {
          content: [{
            type: 'text',
            text: '🛒 No tienes items en tu carrito para confirmar. ¿Te gustaría ver nuestro menú?'
          }],
          isError: true
        };
      }

      // Simular creación de pedido (aquí se integraría con el OrdersService)
      const orderId = `ORD-${Date.now()}`;
      const totalAmount = currentCart.reduce((sum, item) => sum + item.subtotal, 0);
      
      // Limpiar carrito después de confirmar
      this.cart.delete(sessionId);

      return {
        content: [{
          type: 'text',
          text: `🎉 ¡Pedido confirmado!\n\n` +
                `📋 **Número de pedido:** ${orderId}\n` +
                `💰 **Total:** RD$${totalAmount}\n\n` +
                `⏱️ **Tiempo estimado:** 20-30 minutos\n\n` +
                `¡Gracias por elegir Delicia! Tu pedido estará listo pronto. 🍽️`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: 'Error al confirmar el pedido. Por favor intenta de nuevo.'
        }],
        isError: true
      };
    }
  }
} 