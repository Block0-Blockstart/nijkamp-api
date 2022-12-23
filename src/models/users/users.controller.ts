import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Serialize } from '../../common/decorators/serialize.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CreateUserDto } from './dtos/request/create-user.dto';
import { UpdateUserDto } from './dtos/request/update-user.dto';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

@ApiTags('user')
@UseGuards(AdminGuard)
@Controller('user')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Patch('restore/:id')
  @Serialize(User)
  undeleteUser(@Param('id') id: string) {
    return this.userService.unsetDeleted(id);
  }

  @Post()
  @Serialize(User)
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Patch(':id')
  @Serialize(User)
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Get(':id')
  @Serialize(User)
  findOneUser(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get()
  @Serialize(User)
  search(
    @Query('companyName') companyName: string,
    @Query('telephone') telephone: string,
    @Query('email') email: string,
    @Query('ethereumAddress') ethereumAddress: string,
    @Query('ethereumPublicKey') ethereumPublicKey: string,
    @Query('avinetId') avinetId: string
  ) {
    return this.userService.searchBy({
      companyName,
      telephone,
      email,
      ethereumAddress,
      ethereumPublicKey,
      avinetId,
    });
  }

  @Delete(':id')
  @Serialize(User)
  deleteUser(@Param('id') id: string) {
    return this.userService.setDeleted(id);
  }
}
