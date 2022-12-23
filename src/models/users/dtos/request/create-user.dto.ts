import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, Length, MaxLength, MinLength } from 'class-validator';
import { IsEthereumAddress } from '../../../../common/validators/eth-address.validator';
import { Role } from '../../schemas/user.schema';

export class CreateUserDto {
  @ApiProperty()
  @IsEthereumAddress()
  @IsOptional()
  ethereumAddress: string;

  @ApiProperty()
  @IsString()
  @Length(132)
  @IsOptional()
  ethereumPublicKey: string;

  @ApiProperty()
  @IsEmail()
  @MinLength(4)
  @MaxLength(255)
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  @IsOptional()
  avinetId: string;

  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(255)
  @IsOptional()
  companyName: string;

  @ApiProperty()
  @MinLength(4)
  @MaxLength(255)
  @IsOptional()
  telephone: string;

  @ApiProperty()
  @IsEnum(Role)
  @IsOptional()
  role: string;
}
