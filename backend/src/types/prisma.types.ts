// Tipos personalizados de Prisma para evitar problemas de import
// Esta es una solución temporal hasta resolver el cliente de Prisma

export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
  COOK = 'COOK',
  CUSTOMER = 'CUSTOMER'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
} 