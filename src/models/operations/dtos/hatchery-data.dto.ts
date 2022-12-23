import { Equals, IsNumber, IsOptional, IsString } from 'class-validator';
import { Operations } from '../operations.enum';

export class HatcheryDataDto {
  @Equals(Operations.pushHatcheryData)
  opName: string;

  @IsString()
  batchId: string;

  @IsString()
  @IsOptional()
  race: string;

  @IsNumber()
  @IsOptional()
  units: number;

  @IsString()
  @IsOptional()
  breederId: string;

  @IsString()
  @IsOptional()
  hatcheryKipId: string;

  @IsNumber()
  @IsOptional()
  farmerSetupDate: number;
}
