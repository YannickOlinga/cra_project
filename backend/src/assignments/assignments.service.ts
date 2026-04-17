import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { Assignment } from './entities/assignment.entity';
import { AccountRole } from '../auth/dto/register-account.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentsRepository: Repository<Assignment>,
  ) {}

  async create(
    createAssignmentDto: CreateAssignmentDto,
    authUser: AuthenticatedUser,
  ) {
    if (
      createAssignmentDto.hourly_rate <= 0 ||
      createAssignmentDto.budget <= 0
    ) {
      throw new BadRequestException(
        'Hourly rate and budget must be strictly positive.',
      );
    }
    if (createAssignmentDto.budget < createAssignmentDto.hourly_rate) {
      throw new BadRequestException(
        'Budget cannot be lower than the hourly rate.',
      );
    }

    let { customers_id, providers_id } = createAssignmentDto;

    // Forcer le client ou le prestataire en fonction du rôle
    if (authUser.role === AccountRole.Customer) {
      customers_id = authUser.profileId;
    } else if (authUser.role === AccountRole.Provider) {
      providers_id = authUser.profileId;
    }

    const assignment = this.assignmentsRepository.create({
      ...createAssignmentDto,
      customers_id,
      providers_id,
    });

    return this.assignmentsRepository.save(assignment);
  }

  async findAll(authUser: AuthenticatedUser) {
    const whereCondition: Partial<Assignment> = {};
    if (authUser.role === AccountRole.Customer) {
      whereCondition['customers_id'] = authUser.profileId;
    } else if (authUser.role === AccountRole.Provider) {
      whereCondition['providers_id'] = authUser.profileId;
    }

    return this.assignmentsRepository.find({
      where: whereCondition,
      relations: ['provider', 'customer'],
    });
  }

  async findOne(id: number, authUser: AuthenticatedUser) {
    const whereCondition: Partial<Assignment> = { id };
    if (authUser.role === AccountRole.Customer) {
      whereCondition['customers_id'] = authUser.profileId;
    } else if (authUser.role === AccountRole.Provider) {
      whereCondition['providers_id'] = authUser.profileId;
    }

    const assignment = await this.assignmentsRepository.findOne({
      where: whereCondition,
      relations: ['provider', 'customer'],
    });

    if (!assignment) {
      throw new NotFoundException(
        `Assignment with ID ${id} not found or you don't have access`,
      );
    }
    return assignment;
  }

  async update(
    id: number,
    updateAssignmentDto: UpdateAssignmentDto,
    authUser: AuthenticatedUser,
  ) {
    const assignment = await this.findOne(id, authUser);

    if (authUser.role !== AccountRole.Customer) {
      throw new ForbiddenException('Only customers can update assignments.');
    }

    // Empêcher le changement d'acteurs
    if (
      updateAssignmentDto.customers_id !== undefined ||
      updateAssignmentDto.providers_id !== undefined
    ) {
      throw new BadRequestException(
        'Cannot change customer or provider after creation.',
      );
    }

    Object.assign(assignment, updateAssignmentDto);
    return this.assignmentsRepository.save(assignment);
  }

  async remove(id: number, authUser: AuthenticatedUser) {
    const assignment = await this.findOne(id, authUser);

    if (authUser.role !== AccountRole.Customer) {
      throw new ForbiddenException('Only customers can delete assignments.');
    }

    // TODO: Implémenter la vérification des pointages (CRA) existants
    // Si des heures ont été pointées sur cette mission, empêcher la suppression !
    // throw new BadRequestException('Cannot delete assignment because CRA hours are logged.');

    return this.assignmentsRepository.remove(assignment);
  }
}
