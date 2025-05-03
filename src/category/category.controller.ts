import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CategoryService } from './category.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/database/enums/user-role.enum';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async createCategory(@Body('name') name: string) {
    return await this.categoryService.create(name);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch()
  async updateCategory(@Body() dto: UpdateCategoryDto) {
    return await this.categoryService.update(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete()
  async deleteCategory(@Body('id') id: string) {
    await this.categoryService.delete(id);
    return { message: 'OK' };
  }

  @Get()
  async getAllCategories() {
    return await this.categoryService.findAll();
  }

  @Get(':id')
  async getCategory(@Param('id') id: string) {
    return await this.categoryService.findById(id);
  }
}
