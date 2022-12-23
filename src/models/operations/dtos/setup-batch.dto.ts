import { Equals, IsArray, IsString } from 'class-validator';
import { Operations } from '../operations.enum';

export class SetupBatchDto {
  @Equals(Operations.setupBatch)
  opName: string;

  @IsString()
  batchId: string;

  @IsArray()
  @IsString({ each: true })
  origins: string[];
}
