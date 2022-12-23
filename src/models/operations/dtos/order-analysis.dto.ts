import { Equals, IsString } from 'class-validator';
import { Operations } from '../operations.enum';

export class OrderAnalysisDto {
  @Equals(Operations.orderAnalysis)
  opName: string;

  @IsString()
  batchId: string;

  @IsString()
  orderId: string;

  @IsString()
  laboratoryEthereumAddress: string;
}
