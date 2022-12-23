import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { IsEthereumAddress } from '../../../../common/validators/eth-address.validator';
import { Role } from '../../schemas/user.schema';

export class UpdateUserDto {
  @ApiProperty()
  @IsEthereumAddress()
  @IsOptional()
  ethereumAddress: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  ethereumPublicKey: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  avinetId: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @IsOptional()
  companyName: string;

  @ApiProperty()
  @IsOptional()
  telephone: string;

  @ApiProperty()
  @IsEnum(Role)
  @IsOptional()
  role: string;
}
