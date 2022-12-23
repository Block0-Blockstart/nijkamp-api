import { Equals, IsNumber, IsOptional, IsString } from 'class-validator';
import { Operations } from '../operations.enum';

export class LaboratoryDataDto {
  @Equals(Operations.pushLaboratoryData)
  opName: string;

  @IsString()
  batchId: string;

  @IsString()
  orderId: string;

  @IsNumber()
  @IsOptional()
  testingDate: number;

  @IsString()
  salmonellaStatus: string;
}
