import { BadRequestException, Controller, Post } from '@nestjs/common';
import { ProductionDataService } from './production-data.service';
import { CurrentOperation } from './middlewares/current-operation.decorator';
import { ICurrentOperation, IOperation } from './middlewares/current-operation.middleware';
import { Operations } from './operations.enum';
import { SetupBatchDto } from './dtos/setup-batch.dto';
import { validate } from 'class-validator';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { OrderAnalysisDto } from './dtos/order-analysis.dto';
import { ReleaseBatchDto } from './dtos/release-batch.dto';
import { HatcheryDataDto } from './dtos/hatchery-data.dto';
import { FarmerDataDto } from './dtos/farmer-data.dto';
import { SlaughterhouseDataDto } from './dtos/slaughterhouse-data.dto';
import { LaboratoryDataDto } from './dtos/laboratory-data.dto';
import { GetBatchDto } from './dtos/get-batch.dto';
import { GetProductionChainDto } from './dtos/get-production-chain.dto';
import { ApiTags } from '@nestjs/swagger';
import { NotarizationService } from '../notarizations/notarization.service';
import { FindNotarizationsDto } from './dtos/find-notarizations.dto';
import { parseValidationErrors } from '../../common/validators/utils/parse-validation-errors';

@ApiTags('production-data')
@Controller()
export class ProductionDataController {
  constructor(private readonly pds: ProductionDataService, private readonly notarizationService: NotarizationService) {}

  @Post('/operation')
  async postOperation(@CurrentOperation() { operation: op, error: err }: ICurrentOperation) {
    if (!op) throw new BadRequestException(err);

    async function validateDto<E extends object>(
      op: IOperation<any>,
      dtoClass: ClassConstructor<E>
    ): Promise<IOperation<E>> {
      const errors = await validate(plainToInstance(dtoClass, op.opPayload));
      const errorMessage = parseValidationErrors(errors);
      if (errorMessage) throw new BadRequestException(errorMessage);
      return op;
    }

    switch (op.opPayload.opName) {
      case Operations.setupBatch:
        return await this.pds.setupBatch(await validateDto<SetupBatchDto>(op, SetupBatchDto));
      case Operations.releaseBatch:
        return await this.pds.releaseBatch(await validateDto<ReleaseBatchDto>(op, ReleaseBatchDto));
      case Operations.pushHatcheryData:
        return await this.pds.pushHatcheryData(await validateDto<HatcheryDataDto>(op, HatcheryDataDto));
      case Operations.pushFarmerData:
        return await this.pds.pushFarmerData(await validateDto<FarmerDataDto>(op, FarmerDataDto));
      case Operations.pushSlaughterhouseData:
        return await this.pds.pushSlaughterHouseData(
          await validateDto<SlaughterhouseDataDto>(op, SlaughterhouseDataDto)
        );
      case Operations.orderAnalysis:
        return await this.pds.orderAnalysis(await validateDto<OrderAnalysisDto>(op, OrderAnalysisDto));
      case Operations.pushLaboratoryData:
        return await this.pds.pushLaboratoryData(await validateDto<LaboratoryDataDto>(op, LaboratoryDataDto));
      case Operations.getBatch:
        return await this.pds.getBatch(await validateDto<GetBatchDto>(op, GetBatchDto));
      case Operations.getProductionChain:
        return await this.pds.getProductionChain(await validateDto<GetProductionChainDto>(op, GetProductionChainDto));
      case Operations.findNotarizations:
        return await this.pds.findNotarizations(await validateDto<FindNotarizationsDto>(op, FindNotarizationsDto));
      default:
        throw new BadRequestException('Unknown operation');
    }
  }

  @Post('/verify-operation')
  async verifyOperation(@CurrentOperation() { operation: op, error: err }: ICurrentOperation) {
    if (!op) throw new BadRequestException(err);

    return await this.notarizationService.verify(op);
  }
}
