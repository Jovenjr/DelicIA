// Tipos para el módulo de IA de Delicia

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  ingredients?: string[];
  allergens?: string[];
  preparationTime?: number;
  image?: string;
}

export interface CartItem {
  itemId: number;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  sessionId: string;
}

export interface OrderItem {
  itemId: number;
  quantity: number;
  notes?: string;
}

export interface ConversationContext {
  sessionId: string;
  userId?: string;
  currentStep: 'greeting' | 'browsing' | 'ordering' | 'confirming' | 'completed';
  lastActivity: Date;
  cart: Cart;
  preferences?: {
    language: 'es' | 'en';
    dietaryRestrictions?: string[];
  };
}

export interface AIResponse {
  message: string;
  action?: 'add_to_cart' | 'remove_from_cart' | 'create_order' | 'get_menu' | 'get_recommendations' | 'get_cart_summary';
  data?: any;
  context?: Partial<ConversationContext>;
}

export interface MCPToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    url?: string;
    data?: any;
  }>;
  isError?: boolean;
}

export interface RecommendationCriteria {
  category?: string;
  maxPrice?: number;
  minPrice?: number;
  dietary?: string[];
  popularity?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sessionId: string;
  action?: string;
  metadata?: {
    toolCalls?: string[];
    context?: Partial<ConversationContext>;
  };
}

export interface MCPServerConfig {
  name: string;
  version: string;
  capabilities: {
    tools: boolean;
    resources: boolean;
    prompts: boolean;
  };
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt: string;
} 