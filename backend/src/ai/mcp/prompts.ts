import { z } from 'zod';

// Schemas de validación para prompts MCP
export const GetPromptSchema = z.object({
  name: z.string().describe('Nombre del prompt a obtener'),
  context: z.object({
    step: z.enum(['greeting', 'browsing', 'ordering', 'confirming', 'completed']).optional(),
    language: z.enum(['es', 'en']).optional().default('es'),
    customerType: z.enum(['regular', 'first_time', 'vip']).optional().default('regular'),
    timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).optional(),
    hasCart: z.boolean().optional().default(false),
    cartItemCount: z.number().optional().default(0)
  }).optional()
});

export interface PromptTemplate {
  name: string;
  description: string;
  template: string;
  variables: string[];
  context: {
    step?: string;
    language?: string;
    customerType?: string;
    timeOfDay?: string;
  };
}

export class DeliciaMCPPrompts {
  private static prompts: Map<string, PromptTemplate> = new Map([
    // Prompt de saludo inicial
    ['greeting_standard', {
      name: 'greeting_standard',
      description: 'Saludo estándar para nuevos clientes',
      template: `¡{{greeting}}! 👋 

Bienvenido a **Delicia**, tu restaurante dominicano favorito donde cada plato cuenta una historia de sabor y tradición. 

Soy Clara, tu asistente virtual, y estoy aquí para ayudarte a descubrir nuestros deliciosos platos caseros hechos con amor y los mejores ingredientes frescos.

{{question}}`,
      variables: ['greeting', 'question'],
      context: { step: 'greeting', language: 'es', customerType: 'regular' }
    }],

    // Prompt de saludo VIP
    ['greeting_vip', {
      name: 'greeting_vip',
      description: 'Saludo especial para clientes VIP',
      template: `¡{{greeting}}! 🌟 

¡Qué alegría verte de nuevo en **Delicia**! Como uno de nuestros clientes especiales, tengo preparadas algunas sorpresas para ti.

Hoy tenemos promociones exclusivas y puedo recomendarte nuestros platos más populares basándome en tus pedidos anteriores.

{{question}}`,
      variables: ['greeting', 'question'],
      context: { step: 'greeting', language: 'es', customerType: 'vip' }
    }],

    // Prompt para mostrar menú
    ['menu_presentation', {
      name: 'menu_presentation',
      description: 'Presentación del menú con personalidad dominicana',
      template: `🍽️ **Nuestro Menú Tradicional Dominicano**

{{menu_content}}

Todos nuestros platos son preparados al momento con ingredientes frescos y siguiendo las recetas tradicionales de nuestras abuelas dominicanas. 

💡 **Tip de Clara:** {{recommendation}}

¿Qué se te antoja hoy? Puedo contarte más detalles sobre cualquier plato o ayudarte a elegir según tus gustos.`,
      variables: ['menu_content', 'recommendation'],
      context: { step: 'browsing', language: 'es' }
    }],

    // Prompt para recomendar platos
    ['recommendation_system', {
      name: 'recommendation_system',
      description: 'Sistema de recomendaciones personalizado',
      template: `🌟 **Mis Recomendaciones para Ti**

{{recommendations}}

**¿Por qué te recomiendo esto?**
{{reasoning}}

{{time_context}}

¿Te llama la atención alguna de estas opciones? Puedo contarte más sobre los ingredientes, preparación o tiempo de entrega.`,
      variables: ['recommendations', 'reasoning', 'time_context'],
      context: { step: 'browsing', language: 'es' }
    }],

    // Prompt para añadir al carrito
    ['add_to_cart_confirmation', {
      name: 'add_to_cart_confirmation',
      description: 'Confirmación al añadir items al carrito',
      template: `✅ ¡Perfecto! He añadido **{{item_name}}** a tu pedido.

🛒 **Tu pedido actual:**
{{cart_summary}}

📋 **Total:** {{total_amount}}
⏱️ **Tiempo estimado:** {{estimated_time}}

{{next_action}}`,
      variables: ['item_name', 'cart_summary', 'total_amount', 'estimated_time', 'next_action'],
      context: { step: 'ordering', language: 'es' }
    }],

    // Prompt para confirmar pedido
    ['order_confirmation', {
      name: 'order_confirmation',
      description: 'Confirmación final del pedido',
      template: `🎉 **¡Pedido Confirmado!**

📋 **Número de orden:** {{order_id}}
💰 **Total a pagar:** {{total_amount}}
⏱️ **Tiempo estimado:** {{delivery_time}}

📍 **Detalles de entrega:**
{{delivery_details}}

**Tu pedido:**
{{order_summary}}

¡Gracias por elegir Delicia! Te enviaremos actualizaciones sobre el estado de tu pedido. 

{{additional_info}}`,
      variables: ['order_id', 'total_amount', 'delivery_time', 'delivery_details', 'order_summary', 'additional_info'],
      context: { step: 'completed', language: 'es' }
    }],

    // Prompt para manejar errores
    ['error_handling', {
      name: 'error_handling',
      description: 'Manejo amigable de errores',
      template: `🤔 **Ups, algo no salió como esperaba...**

{{error_context}}

**Pero no te preocupes,** estoy aquí para ayudarte. Aquí tienes algunas opciones:

{{recovery_options}}

¿Cuál te gustaría probar? O si prefieres, puedes contarme exactamente qué quieres hacer y buscaré otra forma de ayudarte.`,
      variables: ['error_context', 'recovery_options'],
      context: { language: 'es' }
    }],

    // Prompt para preguntas sobre ingredientes
    ['ingredient_inquiry', {
      name: 'ingredient_inquiry',
      description: 'Respuestas sobre ingredientes y alérgenos',
      template: `🧾 **Información sobre {{dish_name}}**

**Ingredientes principales:**
{{ingredients_list}}

{{allergen_info}}

{{dietary_info}}

{{preparation_notes}}

¿Hay algo específico que te preocupe o te gustaría modificar en la preparación?`,
      variables: ['dish_name', 'ingredients_list', 'allergen_info', 'dietary_info', 'preparation_notes'],
      context: { step: 'browsing', language: 'es' }
    }],

    // Prompt para despedida
    ['farewell', {
      name: 'farewell',
      description: 'Despedida cordial y invitación a regresar',
      template: `{{farewell_greeting}}

Ha sido un placer ayudarte hoy en Delicia. {{summary}}

{{call_to_action}}

¡Que disfrutes mucho tu comida y esperamos verte pronto! 🍽️✨

**Delicia** - *Donde cada bocado es una fiesta* 🇩🇴`,
      variables: ['farewell_greeting', 'summary', 'call_to_action'],
      context: { step: 'completed', language: 'es' }
    }]
  ]);

  /**
   * Obtener prompt por nombre
   */
  static getPrompt(name: string): PromptTemplate | undefined {
    return this.prompts.get(name);
  }

  /**
   * Obtener todos los prompts disponibles
   */
  static getAllPrompts(): PromptTemplate[] {
    return Array.from(this.prompts.values());
  }

  /**
   * Procesar template con variables
   */
  static processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;
    
    // Reemplazar variables {{variable}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value || ''));
    });

    // Limpiar variables no reemplazadas
    processed = processed.replace(/{{[^}]+}}/g, '');
    
    return processed.trim();
  }

  /**
   * Generar saludo según contexto
   */
  static generateContextualGreeting(timeOfDay?: string, language: string = 'es'): string {
    const greetings = {
      es: {
        morning: 'Buenos días',
        afternoon: 'Buenas tardes', 
        evening: 'Buenas tardes',
        night: 'Buenas noches',
        default: 'Hola'
      },
      en: {
        morning: 'Good morning',
        afternoon: 'Good afternoon',
        evening: 'Good evening', 
        night: 'Good evening',
        default: 'Hello'
      }
    };

    return greetings[language as keyof typeof greetings]?.[timeOfDay as keyof typeof greetings.es] || 
           greetings[language as keyof typeof greetings]?.default || 
           'Hola';
  }

  /**
   * Generar pregunta de seguimiento según contexto
   */
  static generateFollowUpQuestion(context: any): string {
    const { step, hasCart, cartItemCount, timeOfDay } = context;

    if (step === 'greeting') {
      if (timeOfDay === 'morning') {
        return '¿Te gustaría empezar el día con uno de nuestros desayunos dominicanos?';
      } else if (timeOfDay === 'afternoon') {
        return '¿Qué tal si vemos nuestro menú del almuerzo?';
      } else {
        return '¿Te gustaría ver nuestro menú o tienes algo específico en mente?';
      }
    }

    if (hasCart && cartItemCount > 0) {
      return '¿Deseas añadir algo más a tu pedido o confirmamos lo que tienes?';
    }

    return '¿En qué puedo ayudarte?';
  }

  /**
   * Obtener recomendación basada en hora del día
   */
  static getTimeBasedRecommendation(timeOfDay?: string): string {
    const recommendations = {
      morning: 'Para comenzar bien el día, te recomiendo nuestro Mangú con huevos revueltos.',
      afternoon: 'Para el almuerzo, nuestro Pollo Guisado con arroz y habichuelas es muy popular.',
      evening: 'Para la cena, el Pescado Frito con patacones es una delicia.',
      night: 'Para algo ligero, nuestros postres como el Flan de Coco son perfectos.',
      default: 'Nuestro Pollo Guisado es el favorito de la casa.'
    };

    return recommendations[timeOfDay as keyof typeof recommendations] || recommendations.default;
  }

  /**
   * Filtrar prompts por contexto
   */
  static getPromptsByContext(context: { step?: string; customerType?: string }): PromptTemplate[] {
    return this.getAllPrompts().filter(prompt => {
      if (context.step && prompt.context.step && prompt.context.step !== context.step) {
        return false;
      }
      if (context.customerType && prompt.context.customerType && prompt.context.customerType !== context.customerType) {
        return false;
      }
      return true;
    });
  }
} 