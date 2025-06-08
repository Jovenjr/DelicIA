import { PrismaClient } from '@prisma/client';
import { UserRole } from '../../src/types/prisma.types';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeds...');

  // Crear usuario administrador
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@delicia.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@delicia.com',
      password: adminPassword,
      rol: UserRole.ADMIN,
    },
  });

  // Crear usuario cajero
  const cashierPassword = await bcrypt.hash('cashier123', 10);
  const cashier = await prisma.user.upsert({
    where: { email: 'cajero@delicia.com' },
    update: {},
    create: {
      nombre: 'Juan Cajero',
      email: 'cajero@delicia.com',
      password: cashierPassword,
      rol: UserRole.CASHIER,
    },
  });

  // Crear usuario cocinero
  const cookPassword = await bcrypt.hash('cook123', 10);
  const cook = await prisma.user.upsert({
    where: { email: 'cocinero@delicia.com' },
    update: {},
    create: {
      nombre: 'María Cocinera',
      email: 'cocinero@delicia.com',
      password: cookPassword,
      rol: UserRole.COOK,
    },
  });

  // Crear categorías
  const categories = [
    {
      name: 'Entradas',
      description: 'Aperitivos y entradas para comenzar',
    },
    {
      name: 'Platos Principales',
      description: 'Nuestros platos principales',
    },
    {
      name: 'Postres',
      description: 'Deliciosos postres caseros',
    },
    {
      name: 'Bebidas',
      description: 'Bebidas frías y calientes',
    },
  ];

  const createdCategories: any[] = [];
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    createdCategories.push(created);
  }

  // Crear productos
  const products = [
    // Entradas
    {
      name: 'Empanadas de Carne',
      description: 'Deliciosas empanadas caseras rellenas de carne',
      price: 8.50,
      categoryId: createdCategories[0].id,
      imageUrl: 'https://example.com/empanadas.jpg',
    },
    {
      name: 'Tequeños',
      description: 'Crujientes tequeños de queso',
      price: 6.00,
      categoryId: createdCategories[0].id,
    },
    // Platos Principales
    {
      name: 'Pabellón Criollo',
      description: 'Plato tradicional venezolano con carne, caraotas, arroz y tajadas',
      price: 15.00,
      categoryId: createdCategories[1].id,
    },
    {
      name: 'Pollo a la Plancha',
      description: 'Pechuga de pollo a la plancha con ensalada y papas',
      price: 12.00,
      categoryId: createdCategories[1].id,
    },
    {
      name: 'Pasta Carbonara',
      description: 'Pasta con salsa carbonara y tocino',
      price: 11.50,
      categoryId: createdCategories[1].id,
    },
    // Postres
    {
      name: 'Tres Leches',
      description: 'Tradicional torta tres leches',
      price: 5.50,
      categoryId: createdCategories[2].id,
    },
    {
      name: 'Flan de Caramelo',
      description: 'Cremoso flan casero con caramelo',
      price: 4.50,
      categoryId: createdCategories[2].id,
    },
    // Bebidas
    {
      name: 'Jugo Natural',
      description: 'Jugos naturales de frutas variadas',
      price: 3.50,
      categoryId: createdCategories[3].id,
    },
    {
      name: 'Café Americano',
      description: 'Café americano recién preparado',
      price: 2.50,
      categoryId: createdCategories[3].id,
    },
    {
      name: 'Refresco',
      description: 'Refrescos variados',
      price: 2.00,
      categoryId: createdCategories[3].id,
    },
  ];

  // Verificar si ya existen productos
  const existingProducts = await prisma.product.count();
  if (existingProducts === 0) {
    await prisma.product.createMany({
      data: products,
    });
  }

  console.log('✅ Seeds completados exitosamente');
  console.log(`👤 Admin: admin@delicia.com / admin123`);
  console.log(`👤 Cajero: cajero@delicia.com / cashier123`);
  console.log(`👤 Cocinero: cocinero@delicia.com / cook123`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seeds:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 