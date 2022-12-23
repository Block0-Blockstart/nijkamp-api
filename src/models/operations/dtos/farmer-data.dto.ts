import { Equals, IsNumber, IsOptional, IsString } from 'class-validator';
import { Operations } from '../operations.enum';

export class FarmerDataDto {
  @Equals(Operations.pushFarmerData)
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
  farmerHousing: string;

  @IsString()
  @IsOptional()
  farmerKipId: string;

  @IsNumber()
  @IsOptional()
  farmerSetupDate: number;
}
