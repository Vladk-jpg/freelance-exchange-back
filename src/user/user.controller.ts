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
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/database/enums/user-role.enum';
import { BlockUserDto } from './dto/block-user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return await this.userService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return await this.userService.profile(req.user.id as string);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/:id')
  async getUserProfile(@Param('id') id: string) {
    return await this.userService.findProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getUserByEmail(@Body('email') email: string) {
    return await this.userService.findByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateUser(@Req() req: any, @Body() dto: UpdateUserDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return await this.userService.update(req.user.id as string, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('block')
  async blockUser(@Body() dto: BlockUserDto) {
    return await this.userService.blockByEmail(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('unblock')
  async unblockUser(@Body() dto: BlockUserDto) {
    return await this.userService.unblockByEmail(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('soft-delete')
  async softDeleteUser(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return await this.userService.softDelete(req.user.id as string);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.userService.delete(id);
    return { message: 'OK' };
  }
}
