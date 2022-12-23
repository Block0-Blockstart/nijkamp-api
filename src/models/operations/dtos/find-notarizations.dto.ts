import { Equals, IsString } from 'class-validator';
import { IsNotarizationQuery } from '../../../common/validators/notarization-query.validator';
import { Operations } from '../operations.enum';

export class FindNotarizationsDto {
  @Equals(Operations.findNotarizations)
  opName: string;

  @IsString()
  batchId: string;

  @IsNotarizationQuery()
  query: Record<string, any>;
}
