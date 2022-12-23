import { Equals, IsNumber, IsOptional, IsString } from 'class-validator';
import { Operations } from '../operations.enum';

export class SlaughterhouseDataDto {
  @Equals(Operations.pushSlaughterhouseData)
  opName: string;

  @IsString()
  batchId: string;

  @IsString()
  @IsOptional()
  race: string;

  @IsNumber()
  @IsOptional()
  units: number;

  @IsNumber()
  @IsOptional()
  slaughterDate: number;

  @IsString()
  @IsOptional()
  farmerHousing: string;

  @IsNumber()
  @IsOptional()
  farmerSetupDate: number;
}
