import { IsString, IsOptional, IsUUID, IsEnum, IsObject } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsObject()
  context?: any;
}

export class ChatResponseDto {
  @IsString()
  message: string;

  @IsString()
  sessionId: string;

  @IsOptional()
  @IsEnum(['add_to_cart', 'remove_from_cart', 'create_order', 'get_menu', 'get_recommendations'])
  action?: string;

  @IsOptional()
  @IsObject()
  data?: any;

  @IsOptional()
  @IsObject()
  context?: any;
}

export class AddToCartDto {
  @IsString()
  itemId: string;

  @IsString()
  quantity: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class GetMenuDto {
  @IsOptional()
  @IsString()
  category?: string;
}

export class GetItemDetailsDto {
  @IsString()
  itemId: string;
}

export class RecommendationsDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  maxPrice?: string;

  @IsOptional()
  @IsString()
  minPrice?: string;

  @IsOptional()
  @IsString()
  dietary?: string;
} 