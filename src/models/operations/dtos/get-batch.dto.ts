import { Equals, IsString } from 'class-validator';
import { Operations } from '../operations.enum';

export class GetBatchDto {
  @Equals(Operations.getBatch)
  opName: string;

  @IsString()
  batchId: string;
}
