# 🍽️ Delicia Backend - API REST

Backend desarrollado con **NestJS**, **PostgreSQL**, **Prisma** y **Redis** para el sistema de pedidos de restaurante.

## 🚀 Setup Rápido

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Copia el archivo `.env` y configura las variables:

```env
# Database
DATABASE_URL="postgresql://delicia_user:delicia_pass@localhost:5432/delicia_db"

# JWT
JWT_SECRET="your-secret-key-here-change-in-production"
JWT_EXPIRES_IN="7d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# App
PORT=3000
NODE_ENV="development"
```

### 3. Levantar Servicios con Docker
```bash
docker-compose up -d
```

### 4. Ejecutar Migraciones
```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Ejecutar Seeds
```bash
npm run db:seed
```

### 6. Iniciar Servidor
```bash
npm run start:dev
```

El servidor estará disponible en: `http://localhost:3000`

## 👥 Usuarios de Prueba

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@delicia.com | admin123 |
| Cajero | cajero@delicia.com | cashier123 |
| Cocinero | cocinero@delicia.com | cook123 |

## 📚 Endpoints Principales

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `GET /auth/me` - Perfil del usuario

### Menú
- `GET /menu/categories` - Listar categorías
- `GET /menu/items` - Listar productos
- `GET /menu/items/search?q=query` - Buscar productos

### Pedidos
- `POST /orders` - Crear pedido
- `GET /orders` - Listar pedidos
- `GET /orders/:id` - Detalle de pedido
- `PATCH /orders/:id/status` - Cambiar estado
- `PATCH /orders/:id/pay` - Marcar como pagado

### Usuarios (Solo Admin)
- `GET /users` - Listar usuarios
- `POST /users` - Crear usuario
- `PATCH /users/:id` - Actualizar usuario

## 🏗️ Arquitectura

```
src/
├── auth/           # Autenticación y autorización
├── config/         # Configuración global
├── database/       # Servicio de Prisma
├── menu/           # Gestión de menú
│   ├── categories/ # Categorías
│   └── products/   # Productos
├── orders/         # Gestión de pedidos
└── users/          # Gestión de usuarios
```

## 🔐 Roles y Permisos

- **ADMIN**: Acceso completo al sistema
- **CASHIER**: Gestión de pedidos y pagos
- **COOK**: Cambio de estado de pedidos en cocina
- **CUSTOMER**: Crear pedidos y ver sus propios pedidos

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run start:dev

# Compilar
npm run build

# Tests
npm run test
npm run test:e2e

# Prisma
npx prisma studio          # Interfaz visual de DB
npx prisma migrate dev      # Nueva migración
npx prisma generate         # Regenerar cliente
npx prisma db push          # Push schema sin migración

# Docker
docker-compose up -d        # Levantar servicios
docker-compose down         # Bajar servicios
docker-compose logs         # Ver logs
```

## 📊 Base de Datos

### Modelos Principales
- **User**: Usuarios del sistema
- **Category**: Categorías de productos
- **Product**: Productos del menú
- **Order**: Pedidos
- **OrderItem**: Items de cada pedido

### Estados de Pedido
- `PENDING`: Pendiente (recién creado)
- `PREPARING`: En preparación (cocina)
- `READY`: Listo para entregar
- `COMPLETED`: Completado
- `CANCELLED`: Cancelado

## 🔧 Próximas Implementaciones

- [ ] WebSockets para tiempo real
- [ ] Sistema de notificaciones
- [ ] Cache con Redis
- [ ] Métricas y analytics
- [ ] Upload de imágenes
- [ ] Sistema de inventario

## 📞 Soporte

Para dudas o problemas, contactar al equipo de desarrollo backend. 