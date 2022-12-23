import { ArrayNotEmpty, Equals, IsArray, IsString } from 'class-validator';
import { Operations } from '../operations.enum';

export class ReleaseBatchDto {
  @Equals(Operations.releaseBatch)
  opName: string;

  @IsString()
  batchId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  destinations: string[];
}
