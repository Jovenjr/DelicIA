import { DeliciaMCPPrompts } from './prompts';

describe('DeliciaMCPPrompts', () => {
  describe('getPrompt', () => {
    it('debería obtener un prompt existente', () => {
      const prompt = DeliciaMCPPrompts.getPrompt('greeting_standard');
      expect(prompt).toBeDefined();
      expect(prompt?.name).toBe('greeting_standard');
      expect(prompt?.template).toContain('{{greeting}}');
    });

    it('debería retornar undefined para prompt inexistente', () => {
      const prompt = DeliciaMCPPrompts.getPrompt('prompt_inexistente');
      expect(prompt).toBeUndefined();
    });
  });

  describe('processTemplate', () => {
    it('debería reemplazar variables correctamente', () => {
      const template = '¡{{greeting}}! Bienvenido {{name}}, tienes {{items}} items.';
      const variables = {
        greeting: 'Hola',
        name: 'Juan',
        items: '3'
      };

      const result = DeliciaMCPPrompts.processTemplate(template, variables);
      expect(result).toBe('¡Hola! Bienvenido Juan, tienes 3 items.');
    });

    it('debería limpiar variables no reemplazadas', () => {
      const template = 'Hola {{name}}, {{variable_inexistente}} está aquí.';
      const variables = { name: 'María' };

      const result = DeliciaMCPPrompts.processTemplate(template, variables);
      expect(result).toBe('Hola María,  está aquí.');
    });

    it('debería manejar template sin variables', () => {
      const template = 'Mensaje sin variables';
      const result = DeliciaMCPPrompts.processTemplate(template, {});
      expect(result).toBe('Mensaje sin variables');
    });
  });

  describe('generateContextualGreeting', () => {
    it('debería generar saludo en español por defecto', () => {
      const greeting = DeliciaMCPPrompts.generateContextualGreeting('morning');
      expect(greeting).toBe('Buenos días');
    });

    it('debería generar saludo en inglés', () => {
      const greeting = DeliciaMCPPrompts.generateContextualGreeting('afternoon', 'en');
      expect(greeting).toBe('Good afternoon');
    });

    it('debería usar saludo por defecto para hora inválida', () => {
      const greeting = DeliciaMCPPrompts.generateContextualGreeting('invalid_time');
      expect(greeting).toBe('Hola');
    });
  });

  describe('generateFollowUpQuestion', () => {
    it('debería generar pregunta para saludo matutino', () => {
      const question = DeliciaMCPPrompts.generateFollowUpQuestion({
        step: 'greeting',
        timeOfDay: 'morning',
        hasCart: false,
        cartItemCount: 0
      });
      expect(question).toContain('desayunos dominicanos');
    });

    it('debería generar pregunta para carrito con items', () => {
      const question = DeliciaMCPPrompts.generateFollowUpQuestion({
        step: 'ordering',
        hasCart: true,
        cartItemCount: 2
      });
      expect(question).toContain('añadir algo más');
    });

    it('debería generar pregunta genérica por defecto', () => {
      const question = DeliciaMCPPrompts.generateFollowUpQuestion({});
      expect(question).toBe('¿En qué puedo ayudarte?');
    });
  });

  describe('getTimeBasedRecommendation', () => {
    it('debería recomendar desayuno en la mañana', () => {
      const recommendation = DeliciaMCPPrompts.getTimeBasedRecommendation('morning');
      expect(recommendation).toContain('Mangú');
    });

    it('debería recomendar almuerzo en la tarde', () => {
      const recommendation = DeliciaMCPPrompts.getTimeBasedRecommendation('afternoon');
      expect(recommendation).toContain('Pollo Guisado');
    });

    it('debería usar recomendación por defecto', () => {
      const recommendation = DeliciaMCPPrompts.getTimeBasedRecommendation();
      expect(recommendation).toContain('Pollo Guisado');
    });
  });

  describe('getPromptsByContext', () => {
    it('debería filtrar prompts por step', () => {
      const prompts = DeliciaMCPPrompts.getPromptsByContext({ step: 'greeting' });
      const promptNames = prompts.map(p => p.name);
      expect(promptNames).toContain('greeting_standard');
      expect(promptNames).toContain('greeting_vip');
    });

    it('debería filtrar prompts por customerType', () => {
      const prompts = DeliciaMCPPrompts.getPromptsByContext({ customerType: 'vip' });
      const promptNames = prompts.map(p => p.name);
      expect(promptNames).toContain('greeting_vip');
    });

    it('debería retornar todos los prompts sin filtros', () => {
      const allPrompts = DeliciaMCPPrompts.getAllPrompts();
      const filteredPrompts = DeliciaMCPPrompts.getPromptsByContext({});
      expect(filteredPrompts.length).toBe(allPrompts.length);
    });
  });

  describe('getAllPrompts', () => {
    it('debería retornar todos los prompts disponibles', () => {
      const prompts = DeliciaMCPPrompts.getAllPrompts();
      expect(prompts.length).toBeGreaterThan(0);
      
      const promptNames = prompts.map(p => p.name);
      expect(promptNames).toContain('greeting_standard');
      expect(promptNames).toContain('menu_presentation');
      expect(promptNames).toContain('order_confirmation');
    });

    it('debería retornar prompts con estructura correcta', () => {
      const prompts = DeliciaMCPPrompts.getAllPrompts();
      prompts.forEach(prompt => {
        expect(prompt).toHaveProperty('name');
        expect(prompt).toHaveProperty('description');
        expect(prompt).toHaveProperty('template');
        expect(prompt).toHaveProperty('variables');
        expect(prompt).toHaveProperty('context');
        expect(Array.isArray(prompt.variables)).toBe(true);
      });
    });
  });
}); 