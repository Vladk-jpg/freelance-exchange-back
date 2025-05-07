/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/database/entities/project.entity';
import { User } from 'src/database/entities/user.entity';
import { ILike, In, Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { Category } from 'src/database/entities/category.entity';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from './dto/pagination.dto';
import { ProjectStatus } from 'src/database/enums/project-status.enum';
import { SearchProjectsDto } from './dto/search-project.dto';
import { FilterProjectsDto } from './dto/filter-projects.dto';
import { ProjectSort } from './enums/project-sort.enum';
import { Payment } from 'src/database/entities/payment.entity';
import { PaymentStatus } from 'src/database/enums/payment-status.enum';
import { Wallet } from 'src/database/entities/wallet.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
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

  async findByUserId(userId: string) {
    return await this.projectRepo.find({
      where: [{ client: { id: userId } }, { freelancer: { id: userId } }],
      relations: ['client', 'freelancer'],
    });
  }

  async delete(userId: string, projectId: string) {
    await this.checkAffilation(userId, projectId);
    const result = await this.projectRepo.delete(projectId);
    if (result.affected === 0) {
      throw new BadRequestException('Can not delete project');
    }
  }

  async findAll(pagination: PaginationDto) {
    const { limit = 10, offset = 0 } = pagination;

    const [items, total] = await this.projectRepo.findAndCount({
      where: { status: ProjectStatus.CREATED },
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['category'],
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
      relations: ['category'],
    });

    return { data: projects, total, limit, offset };
  }

  async filterProjects(dto: FilterProjectsDto) {
    const { categories, sortBy, offset = 0, limit = 10 } = dto;

    const total = await this.projectRepo.count({
      where: categories?.length ? { category: In(categories) } : {},
    });

    const findOpts: any = {
      relations: ['category'],
      where: categories?.length ? { category: In(categories) } : {},
      skip: offset,
      take: limit,
      order: {},
    };

    if (sortBy === ProjectSort.OLDEST) {
      findOpts.order = { createdAt: 'ASC' };
    } else if (sortBy === ProjectSort.CHEAPEST) {
      findOpts.order = { price: 'ASC' };
    } else if (sortBy === ProjectSort.MOST_EXPENSIVE) {
      findOpts.order = { price: 'DESC' };
    } else {
      findOpts.order = { createdAt: 'DESC' };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    let data = await this.projectRepo.find(findOpts);

    if (sortBy === ProjectSort.RANDOM) {
      data = data.sort(() => Math.random() - 0.5);
    }

    return { data, total, offset, limit };
  }

  async sendApproval(userId: string, projectId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['freelancer'],
    });
    if (!project) throw new BadRequestException('Project not found');
    if (project.freelancer.id !== userId)
      throw new ForbiddenException(
        'You can not send approval for this project',
      );
    project.status = ProjectStatus.AWAITING_APPROVAL;
    await this.projectRepo.save(project);
  }

  async approve(userId: string, projectId: string) {
    const project = await this.checkAffilation(userId, projectId);
    if (project.status !== ProjectStatus.AWAITING_APPROVAL)
      throw new ForbiddenException('You can not approve project');

    const payment = await this.paymentRepo.findOne({
      where: { projectId: projectId },
    });
    if (!payment) throw new BadRequestException('Payment not found');
    if (payment.status !== PaymentStatus.RESERVED)
      throw new ForbiddenException('You can not approve project');

    const freelancer = await this.userRepo.findOne({
      where: { id: payment.recepientId },
      relations: ['wallet'],
    });
    if (!freelancer) throw new BadRequestException('Freelancer not found');
    freelancer.wallet.balance += project.price;
    await this.walletRepo.save(freelancer.wallet);

    payment.status = PaymentStatus.COMPLITED;
    await this.paymentRepo.save(payment);

    project.status = ProjectStatus.COMPLETED;
    await this.projectRepo.save(project);
  }

  async refund(userId: string, projectId: string) {
    const project = await this.checkAffilation(userId, projectId);
    if (
      project.status !== ProjectStatus.IN_PROGRESS ||
      project.updatedAt < new Date(Date.now() - 1000 * 60 * 60 * 24)
    )
      throw new ForbiddenException('You can not cancel project');

    const payment = await this.paymentRepo.findOne({
      where: { projectId: projectId },
    });
    if (!payment) throw new BadRequestException('Payment not found');
    if (payment.status !== PaymentStatus.RESERVED)
      throw new ForbiddenException('You can not cancel project');

    const client = await this.userRepo.findOne({
      where: { id: payment.senderId },
      relations: ['wallet'],
    });
    if (!client) throw new BadRequestException('Client not found');
    client.wallet.balance += project.price;
    await this.walletRepo.save(client.wallet);

    payment.status = PaymentStatus.REFUNDED;
    await this.paymentRepo.save(payment);
    project.status = ProjectStatus.CANCELLED;
    await this.projectRepo.save(project);
  }

  async cancelApproval(userId: string, projectId: string) {
    const project = await this.checkAffilation(userId, projectId);
    if (project.status !== ProjectStatus.AWAITING_APPROVAL)
      throw new ForbiddenException('You can not cancel approval');

    project.status = ProjectStatus.IN_PROGRESS;
    await this.projectRepo.save(project);
  }
}
