import { IsNotEmpty, IsString, IsOptional, MaxLength, IsNumber, IsPositive, IsUUID, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  price: number;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;
} 