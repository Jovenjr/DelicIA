# 📚 **Investigación Model Context Protocol (MCP) - Delicia**

## 🎯 **Resumen Ejecutivo**

Tras la investigación de la documentación oficial de Anthropic y múltiples fuentes, MCP (Model Context Protocol) es un protocolo abierto que **estandariza cómo las aplicaciones proporcionan contexto a los LLMs**. Es como "un puerto USB-C para aplicaciones de IA", permitiendo conexiones estandarizadas entre modelos de IA y fuentes de datos/herramientas.

---

## 🏗️ **Arquitectura Fundamental de MCP**

### **Componentes Principales:**

1. **Host**: Aplicación que contiene y coordina el LLM
2. **Client**: Conectores dentro del host (relación 1:1 con servidores)
3. **Server**: Servicios que proporcionan contexto y capacidades

### **Flujo de Comunicación:**
```
Host Application (Claude, Cursor, etc.)
    ↓ maneja múltiples
MCP Clients (1:1 relationship)
    ↓ se conecta a
MCP Servers (exponen recursos, herramientas, prompts)
    ↓ acceden a
Data Sources / APIs / Bases de Datos
```

---

## 🔧 **Características Clave de MCP**

### **Tres Primitivas Fundamentales:**

#### **1. Resources (Recursos)**
- **Propósito**: Proporcionar datos como contexto al LLM
- **Naturaleza**: Solo lectura, similar a endpoints GET
- **Ejemplos**: archivos, esquemas de BD, logs, documentos
- **Control**: Impulsado por la aplicación (el host decide cómo usar)

#### **2. Tools (Herramientas)**  
- **Propósito**: Permitir que LLMs realicen acciones
- **Naturaleza**: Puede tener efectos secundarios, similar a endpoints POST
- **Ejemplos**: consultas DB, llamadas API, cálculos
- **Control**: Controlado por el modelo (el LLM decide cuándo usar)

#### **3. Prompts (Plantillas)**
- **Propósito**: Patrones reutilizables para interacciones con LLM
- **Naturaleza**: Templates parametrizables  
- **Control**: Controlado por usuario (comandos explícitos)

---

## 🔗 **Protocolo y Comunicación**

### **Base Técnica:**
- **Protocolo**: JSON-RPC 2.0
- **Transporte**: stdio, HTTP Streamable, SSE (deprecated)
- **Tipos de Mensaje**: Requests, Responses, Notifications
- **Seguridad**: Capacidades negociadas, consent del usuario

### **Lifecycle de Conexión:**
1. **Initialization**: Negociación de capacidades y versión
2. **Operation**: Comunicación normal del protocolo  
3. **Shutdown**: Terminación limpia de la conexión

---

## 💡 **Ventajas Clave para Delicia**

### **Para Desarrolladores de IA:**
- ✅ **Cero trabajo adicional** para conectar nuevos servidores MCP
- ✅ **Interfaz estandarizada** (prompts, tools, resources)
- ✅ **Foco en lógica core** en lugar de integraciones personalizadas
- ✅ **Capacidad del modelo para decidir** uso inteligente de herramientas

### **Para Usuarios Finales:**  
- ✅ **Aplicaciones más potentes** y contextuales
- ✅ **Interacciones conscientes del contexto**
- ✅ **Integración con herramientas familiares**
- ✅ **Asistencia más inteligente**

---

## 🛠️ **SDK TypeScript - Componentes Técnicos**

### **Instalación Base:**
```bash
npm install @modelcontextprotocol/sdk zod
```

### **Estructura del Servidor:**
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "Delicia-AI-Server", 
  version: "1.0.0"
});
```

### **Implementación de Herramientas:**
```typescript
server.tool("getMenu",
  { category: z.string().optional() },
  async ({ category }) => ({
    content: [{ type: "text", text: menuData }]
  })
);
```

### **Recursos Dinámicos:**
```typescript
server.resource(
  "menu-item",
  new ResourceTemplate("menu://{itemId}", { list: undefined }),
  async (uri, { itemId }) => ({
    contents: [{
      uri: uri.href,
      text: getItemDetails(itemId)
    }]
  })
);
```

---

## 🔐 **Seguridad y Mejores Prácticas**

### **Principios de Seguridad:**
1. **User Consent**: Consentimiento explícito para todas las operaciones
2. **Data Privacy**: Control explícito sobre datos compartidos  
3. **Tool Safety**: Consentimiento antes de ejecutar herramientas
4. **LLM Sampling Controls**: Aprobación explícita para sampling

### **Implementación Recomendada:**
- ✅ Flujos robustos de consent y autorización
- ✅ Documentación clara de implicaciones de seguridad
- ✅ Controles de acceso apropiados
- ✅ Seguir mejores prácticas de seguridad

---

## 🚀 **Plan de Implementación para Delicia**

### **Fase 1: Setup Base (TASK 1.1-1.3)**
1. **Investigación Técnica** ✅ COMPLETADA
2. **Setup del Proyecto IA** 
   - Crear módulo `AIModule` en NestJS
   - Instalar SDK MCP TypeScript
   - Configurar variables de entorno
3. **Configuración Base MCP**
   - Inicializar servidor MCP
   - Configurar cliente LLM (OpenAI/Claude)
   - Establecer conexión MCP-backend

### **Herramientas Clave a Implementar:**
```typescript
// Herramientas esenciales para Delicia
- getMenu(category?: string)
- findItem(name: string)  
- getItemDetails(id: number)
- addToCart(itemId: number, quantity: number, notes?: string)
- getCartSummary()
- createOrder(items: OrderItem[])
- confirmOrder()
```

### **Flujo Conversacional Objetivo:**
```
Usuario: "Hola, ¿qué tienen de pollo?"
Bot: [llama getMenu("pollo")] "¡Hola! Tenemos Pollo Guisado ($350), Pollo al Horno ($400)..."

Usuario: "Quiero el guisado"  
Bot: [llama addToCart(polloGuisadoId, 1)] "¡Perfecto! Añadí 1 Pollo Guisado a tu pedido..."
```

---

## 📋 **Siguientes Pasos Inmediatos**

### **TASK 1.2: Setup del Proyecto IA** (PRÓXIMO)
1. Crear módulo `AIModule` en NestJS 
2. Instalar dependencias MCP
3. Configurar estructura de carpetas
4. Setup variables de entorno

### **Dependencias Principales:**
- `@modelcontextprotocol/sdk` - SDK oficial MCP
- `openai` / `@anthropic-ai/sdk` - Cliente LLM  
- `zod` - Validación de schemas
- `class-validator` - Validación NestJS

---

## 🔗 **Recursos y Referencias**

### **Documentación Oficial:**
- [MCP Introduction](https://modelcontextprotocol.io/introduction)
- [Anthropic MCP Guide](https://docs.anthropic.com/en/docs/agents-and-tools/mcp)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

### **Tutoriales Prácticos:**
- [How to build MCP servers with TypeScript SDK](https://dev.to/shadid12/how-to-build-mcp-servers-with-typescript-sdk-1c28)
- [Step-by-Step Guide: Setting Up MCP Locally](https://dev.to/balajikandavel/step-by-step-guide-setting-up-mcp-locally-with-llms-using-typescript-64e)

### **Especificación Técnica:**
- [MCP Specification 2024-11-05](https://spec.modelcontextprotocol.io/specification/2024-11-05/)

---

## ✨ **Notas Importantes para Delicia**

1. **Personalidad del Bot**: Tono amigable con dominicanismos suaves
2. **Prompts Ejemplo**: 
   - Saludo: "¡Hola! 🍽️ Soy tu asistente de Delicia..."
   - Recomendación: "Te recomiendo nuestro Pollo Guisado, ¡está buenísimo!"
3. **Integración Backend**: Coordinar con desarrollador backend para APIs necesarias
4. **Testing**: Usar MCP Inspector para debug y testing

**¡Listo para comenzar implementación! 🚀** 