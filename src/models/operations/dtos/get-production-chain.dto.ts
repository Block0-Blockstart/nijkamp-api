import { Equals, IsString } from 'class-validator';
import { Operations } from '../operations.enum';

export class GetProductionChainDto {
  @Equals(Operations.getProductionChain)
  opName: string;

  @IsString()
  batchId: string;
}
