import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, ...userData } = createUserDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await this.databaseService.user.create({
      data: {
        ...userData,
        email,
        password: hashedPassword,
      },
    });

    // Retornar sin password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll() {
    const users = await this.databaseService.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return users;
  }

  async findOne(id: string) {
    const user = await this.databaseService.user.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, email, ...updateData } = updateUserDto;

    // Verificar si el usuario existe
    const existingUser = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si se está actualizando el email, verificar que no exista
    if (email && email !== existingUser.email) {
      const emailExists = await this.databaseService.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    // Preparar datos de actualización
    const dataToUpdate: any = { ...updateData };
    if (email) dataToUpdate.email = email;
    if (password) dataToUpdate.password = await bcrypt.hash(password, 10);

    // Actualizar usuario
    const updatedUser = await this.databaseService.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async remove(id: string) {
    // Verificar si el usuario existe
    const existingUser = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Soft delete
    await this.databaseService.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Usuario eliminado exitosamente' };
  }
}
