import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createProductDto: CreateProductDto) {
    const { categoryId } = createProductDto;

    // Verificar si la categoría existe
    const category = await this.databaseService.category.findUnique({
      where: { id: categoryId, isActive: true },
    });

    if (!category) {
      throw new BadRequestException('La categoría no existe o no está activa');
    }

    return this.databaseService.product.create({
      data: createProductDto,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(categoryId?: string, available?: boolean) {
    const where: any = {};
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (available !== undefined) {
      where.isAvailable = available;
    }

    return this.databaseService.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.databaseService.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { categoryId } = updateProductDto;

    // Verificar si el producto existe
    const existingProduct = await this.databaseService.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Si se está actualizando la categoría, verificar que exista
    if (categoryId) {
      const category = await this.databaseService.category.findUnique({
        where: { id: categoryId, isActive: true },
      });

      if (!category) {
        throw new BadRequestException('La categoría no existe o no está activa');
      }
    }

    return this.databaseService.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Verificar si el producto existe
    const existingProduct = await this.databaseService.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Verificar si el producto está en pedidos activos
    const activeOrders = await this.databaseService.orderItem.findFirst({
      where: {
        productId: id,
        order: {
          status: {
            in: ['PENDING', 'PREPARING'],
          },
        },
      },
    });

    if (activeOrders) {
      throw new BadRequestException('No se puede eliminar un producto que está en pedidos activos');
    }

    // Soft delete - marcar como no disponible
    await this.databaseService.product.update({
      where: { id },
      data: { isAvailable: false },
    });

    return { message: 'Producto eliminado exitosamente' };
  }

  // Método para búsqueda
  async search(query: string) {
    return this.databaseService.product.findMany({
      where: {
        AND: [
          { isAvailable: true },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
