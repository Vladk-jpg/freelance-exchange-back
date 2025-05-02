import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/database/entities/project.entity';
import { User } from 'src/database/entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { Category } from 'src/database/entities/category.entity';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from './dto/pagination.dto';
import { ProjectStatus } from 'src/database/enums/project-status.enum';
import { SearchProjectsDto } from './dto/search-project.dto';
import { FilterProjectsDto } from './dto/filter-projects.dto';
import { ProjectSort } from './enums/project-sort.enum';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  private async checkAffilation(userId: string, projectId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['client'],
    });
    if (!project) throw new BadRequestException('Project not found');
    if (project.client.id != userId)
      throw new ForbiddenException('You can not access to this project');
    return project;
  }

  async create(userId: string, dto: CreateProjectDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) throw new BadRequestException('Category not found');
    const project = this.projectRepo.create();
    project.title = dto.title;
    project.descriprion = dto.description;
    project.price = parseFloat(dto.price);
    project.category = category;
    project.client = user;
    return await this.projectRepo.save(project);
  }

  async update(projectId: string, userId: string, dto: UpdateProjectDto) {
    const project = await this.checkAffilation(userId, projectId);
    if (dto.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { id: dto.categoryId },
      });
      if (category) project.category = category;
    }
    if (dto.description) project.descriprion = dto.description;
    if (dto.price) project.price = dto.price;
    if (dto.title) project.title = dto.title;
    return await this.projectRepo.save(project);
  }

  async findById(projectId: string) {
    return await this.projectRepo.findOne({ where: { id: projectId } });
  }

  // Write filter for finding particular projects
  /*
  {
    "categories": [*array with categories*],
    "sortBy": property for sorting
  }
  */

  async findByUserId(userId: string) {
    return await this.projectRepo.find({
      where: [{ client: { id: userId } }, { freelancer: { id: userId } }],
      relations: ['user'],
    });
  }

  async delete(userId: string, projectId: string) {
    await this.checkAffilation(userId, projectId);
    const result = await this.projectRepo.delete(projectId);
    if (result.affected === 0) {
      throw new BadRequestException('Can not delete user or user not found');
    }
  }

  async findAll(pagination: PaginationDto) {
    const { limit = 10, offset = 0 } = pagination;

    const [items, total] = await this.projectRepo.findAndCount({
      where: { status: ProjectStatus.CREATED },
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: items,
      total,
      limit,
      offset,
    };
  }

  async searchProjects(dto: SearchProjectsDto): Promise<{
    data: Project[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { title = '', offset, limit } = dto;

    const [projects, total] = await this.projectRepo.findAndCount({
      where: {
        title: ILike(`%${title}%`),
        status: ProjectStatus.CREATED,
      },
      skip: offset,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return { data: projects, total, limit, offset };
  }

  async filterProjects(dto: FilterProjectsDto) {
    const { categories, sortBy, offset = 0, limit = 10 } = dto;

    let query = this.projectRepo.createQueryBuilder('project');

    if (categories?.length) {
      query = query.andWhere('project.categoryId IN (:...categories)', {
        categories,
      });
    }

    switch (sortBy) {
      case ProjectSort.OLDEST:
        query = query.orderBy('project.createdAt', 'ASC');
        break;
      case ProjectSort.RANDOM:
        query = query.orderBy('RANDOM()');
        break;
      case ProjectSort.CHEAPEST:
        query = query.orderBy('project.price', 'ASC');
        break;
      case ProjectSort.MOST_EXPENSIVE:
        query = query.orderBy('project.price', 'DESC');
        break;
      default:
        query = query.orderBy('project.createdAt', 'DESC');
    }

    query = query.skip(offset).take(limit);

    const [projects, total] = await query.getManyAndCount();

    return {
      data: projects,
      total,
      offset,
      limit,
    };
  }
}
