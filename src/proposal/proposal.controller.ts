/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/database/enums/user-role.enum';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { ProposalService } from './proposal.service';
import { UUIDParam } from 'src/common/pipes/uuid.pipe';
import { UpdateProposalDto } from './dto/update-proposal.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('proposal')
export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}

  @Roles(UserRole.FREELANCER)
  @Post()
  async createProposal(@Body() dto: CreateProposalDto, @Req() req: any) {
    return await this.proposalService.create(req.user.id as string, dto);
  }

  @Roles(UserRole.CLIENT)
  @Patch('accept/:id')
  async acceptProposal(
    @Param('id', UUIDParam()) proposalId: string,
    @Req() req: any,
  ) {
    await this.proposalService.acceptProposal(
      req.user.id as string,
      proposalId,
    );
    return { message: 'OK' };
  }

  @Roles(UserRole.CLIENT)
  @Patch('reject/:id')
  async rejectProposal(
    @Param('id', UUIDParam()) proposalId: string,
    @Req() req: any,
  ) {
    await this.proposalService.rejectProposal(
      req.user.id as string,
      proposalId,
    );
    return { message: 'OK' };
  }

  @Roles(UserRole.FREELANCER)
  @Delete(':id')
  async deleteProposal(
    @Param('id', UUIDParam()) proposalId: string,
    @Req() req: any,
  ) {
    await this.proposalService.delete(req.user.id as string, proposalId);
    return { message: 'OK' };
  }

  @Roles(UserRole.FREELANCER)
  @Patch(':id')
  async updateProposal(
    @Param('id', UUIDParam()) proposalId: string,
    @Body() dto: UpdateProposalDto,
    @Req() req: any,
  ) {
    return await this.proposalService.update(
      req.user.id as string,
      proposalId,
      dto,
    );
  }

  @Roles(UserRole.FREELANCER)
  @Get('freelancer')
  async findPropsByFreelancer(@Req() req: any) {
    return this.proposalService.findPropsByFreelancer(req.user.id as string);
  }

  @Roles(UserRole.CLIENT)
  @Get('project/:id')
  async findPropsByProject(
    @Req() req: any,
    @Param('id', UUIDParam()) projectId: string,
  ) {
    return await this.proposalService.findProposalsByProject(
      req.user.id as string,
      projectId,
    );
  }

  @Get(':id')
  async findProposalById(@Param('id', UUIDParam()) proposalId: string) {
    return await this.proposalService.findById(proposalId);
  }
}
