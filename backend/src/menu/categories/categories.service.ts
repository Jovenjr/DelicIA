import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name } = createCategoryDto;

    // Verificar si la categoría ya existe
    const existingCategory = await this.databaseService.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      throw new ConflictException('La categoría ya existe');
    }

    return this.databaseService.category.create({
      data: createCategoryDto,
    });
  }

  async findAll() {
    return this.databaseService.category.findMany({
      where: { isActive: true },
      include: {
        products: {
          where: { isAvailable: true },
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.databaseService.category.findUnique({
      where: { id, isActive: true },
      include: {
        products: {
          where: { isAvailable: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { name } = updateCategoryDto;

    // Verificar si la categoría existe
    const existingCategory = await this.databaseService.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Si se está actualizando el nombre, verificar que no exista
    if (name && name !== existingCategory.name) {
      const nameExists = await this.databaseService.category.findUnique({
        where: { name },
      });

      if (nameExists) {
        throw new ConflictException('El nombre de categoría ya está en uso');
      }
    }

    return this.databaseService.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    // Verificar si la categoría existe
    const existingCategory = await this.databaseService.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { isAvailable: true },
        },
      },
    });

    if (!existingCategory) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Verificar si tiene productos activos
    if (existingCategory.products.length > 0) {
      throw new ConflictException('No se puede eliminar una categoría con productos activos');
    }

    // Soft delete
    await this.databaseService.category.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Categoría eliminada exitosamente' };
  }
}
