import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/database/entities/project.entity';
import { Proposal } from 'src/database/entities/proposal.entity';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { ProjectStatus } from 'src/database/enums/project-status.enum';
import { ProposalStatus } from 'src/database/enums/proposal-status.enum';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { UserStatus } from 'src/database/enums/user-status.enum';
import { Wallet } from 'src/database/entities/wallet.entity';
import { Payment } from 'src/database/entities/payment.entity';

@Injectable()
export class ProposalService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Proposal)
    private readonly propRepo: Repository<Proposal>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  private async checkAffilation(userId: string, proposalId: string) {
    const proposal = await this.propRepo.findOne({
      where: { id: proposalId },
      relations: ['freelancer'],
    });
    if (!proposal)
      throw new NotFoundException('Proposal with such id not found');
    if (proposal.freelancer.id !== userId)
      throw new ForbiddenException('You do not have access to this proposal');
    return proposal;
  }

  async create(userId: string, dto: CreateProposalDto) {
    const freelancer = await this.userRepo.findOne({ where: { id: userId } });
    if (!freelancer) throw new NotFoundException('User not found');
    const project = await this.projectRepo.findOne({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.status != ProjectStatus.CREATED)
      throw new BadRequestException('Project is not available');

    const found = await this.propRepo.findOne({
      where: { freelancer: { id: freelancer.id }, project: { id: project.id } },
      relations: ['freelancer', 'project'],
    });
    if (found) {
      throw new ForbiddenException(
        'You have already sent proposal to this project!',
      );
    }

    const proposal = this.propRepo.create();
    proposal.message = dto.message;
    proposal.project = project;
    proposal.freelancer = freelancer;

    return await this.propRepo.save(proposal);
  }

  async delete(userId: string, proposalId: string) {
    await this.checkAffilation(userId, proposalId);
    const result = await this.propRepo.delete(proposalId);
    if (result.affected === 0) {
      throw new BadRequestException('Can not delete proposal');
    }
  }

  async update(userId: string, proposalId: string, dto: UpdateProposalDto) {
    const proposal = await this.checkAffilation(userId, proposalId);
    if (proposal.status != ProposalStatus.PENDING)
      throw new ForbiddenException('You can edit only pending proposals');
    proposal.message = dto.message;
    return await this.propRepo.save(proposal);
  }

  async findPropsByFreelancer(userId: string) {
    const proposals = await this.propRepo.find({
      where: { freelancer: { id: userId } },
      relations: ['freelancer'],
    });
    return proposals.map((value: Partial<Proposal>) => {
      value.freelancer = undefined;
      return value;
    });
  }

  async findProposalsByProject(userId: string, projectId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['client'],
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.client.id !== userId)
      throw new ForbiddenException('You can not access to this information');

    const proposals = await this.propRepo.find({
      where: { project: { id: projectId }, status: ProposalStatus.PENDING },
      relations: ['project', 'freelancer'],
    });

    return proposals.map((value: Partial<Proposal>) => {
      value.project = undefined;
      return value;
    });
  }

  async acceptProposal(userId: string, proposalId: string) {
    const proposal = await this.propRepo.findOne({
      where: { id: proposalId },
      relations: ['project', 'freelancer'],
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    if (proposal.status != ProposalStatus.PENDING)
      throw new ForbiddenException('You can accept only pending proposals');
    if (proposal.freelancer.status != UserStatus.ACTIVE)
      throw new ForbiddenException('Freelancer is not active');

    const project = await this.projectRepo.findOne({
      where: { id: proposal.project.id, client: { id: userId } },
      relations: ['client'],
    });
    if (!project) throw new NotFoundException('Project not found');

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['wallet'],
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.wallet.balance < project.price)
      throw new ForbiddenException('Not enough money');

    proposal.status = ProposalStatus.ACCEPTED;
    project.status = ProjectStatus.IN_PROGRESS;
    project.freelancer = proposal.freelancer;
    user.wallet.balance -= project.price;

    await this.propRepo.save(proposal);
    await this.projectRepo.save(project);
    await this.walletRepo.save(user.wallet);

    const payment = this.paymentRepo.create();
    payment.projectId = project.id;
    payment.senderId = user.id;
    payment.recepientId = proposal.freelancer.id;
    payment.amount = project.price;
    await this.paymentRepo.save(payment);
  }

  async rejectProposal(userId: string, proposalId: string) {
    const proposal = await this.propRepo.findOne({
      where: { id: proposalId },
      relations: ['project'],
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    if (proposal.status != ProposalStatus.PENDING)
      throw new ForbiddenException('You can reject only pending proposals');

    const project = await this.projectRepo.findOne({
      where: { id: proposal.project.id, client: { id: userId } },
      relations: ['client'],
    });
    if (!project) throw new NotFoundException('Project not found');

    proposal.status = ProposalStatus.REJECTED;
    await this.propRepo.save(proposal);
  }

  async findById(proposalId: string) {
    const proposal = await this.propRepo.findOne({
      where: { id: proposalId },
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    return proposal;
  }
}
