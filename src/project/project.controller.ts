import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/database/enums/user-role.enum';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectService } from './project.service';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SearchProjectsDto } from './dto/search-project.dto';
import { FilterProjectsDto } from './dto/filter-projects.dto';
import { UUIDParam } from 'src/common/pipes/uuid.pipe';

@Controller('project')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @Post()
  async createProject(@Body() dto: CreateProjectDto, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return await this.projectService.create(req.user.id as string, dto);
  }

  @Get('filter')
  async filterProjects(@Query() dto: FilterProjectsDto) {
    return await this.projectService.filterProjects(dto);
  }

  @Get('search')
  async search(@Query() dto: SearchProjectsDto) {
    return await this.projectService.searchProjects(dto);
  }

  @Get(':id')
  async getProjectById(@Param('id', UUIDParam()) id: string) {
    const res = await this.projectService.findById(id);
    if (!res) throw new NotFoundException('Project with such id not found');
    return res;
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.projectService.findAll(paginationDto);
  }

  @Get('user/:id')
  async getProjectsByUserId(@Param('id', UUIDParam()) id: string) {
    return await this.projectService.findByUserId(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @Patch(':id')
  async updateProject(
    @Param('id', UUIDParam()) projectId: string,
    @Req() req: any,
    @Body() dto: UpdateProjectDto,
  ) {
    return await this.projectService.update(
      projectId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.user.id as string,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @Delete(':id')
  async deleteProject(
    @Param('id', UUIDParam()) projectId: string,
    @Req() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await this.projectService.delete(req.user.id as string, projectId);
    return { message: 'OK' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FREELANCER)
  @Patch('send-approval/:id')
  async sendApproval(
    @Param('id', UUIDParam()) projectId: string,
    @Req() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await this.projectService.sendApproval(req.user.id as string, projectId);
    return { message: 'OK' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @Patch('approve/:id')
  async approveProject(
    @Param('id', UUIDParam()) projectId: string,
    @Req() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await this.projectService.approve(req.user.id as string, projectId);
    return { message: 'OK' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @Patch('cancel/:id')
  async cancelProject(
    @Param('id', UUIDParam()) projectId: string,
    @Req() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await this.projectService.cancelApproval(req.user.id as string, projectId);
    return { message: 'OK' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @Patch('refund/:id')
  async refundProject(
    @Param('id', UUIDParam()) projectId: string,
    @Req() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await this.projectService.refund(req.user.id as string, projectId);
    return { message: 'OK' };
  }
}
