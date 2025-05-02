import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/database/entities/category.entity';
import { Repository } from 'typeorm';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(name: string): Promise<Category> {
    if (!name) throw new BadRequestException('Name of category is required');
    const category = this.categoryRepo.create();
    category.category = name;
    return await this.categoryRepo.save(category);
  }

  async delete(id: string): Promise<void> {
    const result = await this.categoryRepo.delete(id);
    if (result.affected === 0) {
      throw new BadRequestException(
        'Can not delete category or category not found',
      );
    }
  }

  async update(dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id: dto.id },
    });
    if (!category) throw new BadRequestException('Category not found');
    category.category = dto.name;
    return await this.categoryRepo.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepo.find();
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    return category ? category : null;
  }
}
