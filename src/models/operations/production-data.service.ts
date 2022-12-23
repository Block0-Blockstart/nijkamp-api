import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  MethodNotAllowedException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { SetupBatchDto } from './dtos/setup-batch.dto';
import { IOperation } from './middlewares/current-operation.middleware';
import { OrderAnalysisDto } from './dtos/order-analysis.dto';
import { ReleaseBatchDto } from './dtos/release-batch.dto';
import { HatcheryDataDto } from './dtos/hatchery-data.dto';
import { FarmerDataDto } from './dtos/farmer-data.dto';
import { SlaughterhouseDataDto } from './dtos/slaughterhouse-data.dto';
import { LaboratoryDataDto } from './dtos/laboratory-data.dto';
import { ProductionData, ProductionDataDocument } from './schemas/production-data.schema';
import { Role, UserDocument } from '../users/schemas/user.schema';
import { GetBatchDto } from './dtos/get-batch.dto';
import { GetProductionChainDto } from './dtos/get-production-chain.dto';
import { prepareUpdate } from '../../helpers/mongo-utils';
import { NotarizationService } from '../notarizations/notarization.service';
import { FindNotarizationsDto } from './dtos/find-notarizations.dto';

@Injectable()
export class ProductionDataService {
  private readonly logger = new Logger('ProductionDataService');

  constructor(
    @InjectModel('production-data') private pddm: Model<ProductionDataDocument>,
    private readonly notarizationService: NotarizationService,
    private readonly usersService: UsersService
  ) {}

  private async checkOwner(
    ethereumAddress: string,
    batchId: string
  ): Promise<{ user: UserDocument; productionData: ProductionDataDocument }> {
    // will throw if user not found
    const user = await this.usersService.findOneByEthereumAddress(ethereumAddress);

    const productionData = await this.pddm.findOne({ batchId });
    if (!productionData) throw new NotFoundException(`Batch with Id ${batchId} not found.`);
    if (productionData.user !== user.ethereumAddress) throw new UnauthorizedException();

    return { user, productionData };
  }

  private logOperation(dto: IOperation<any>) {
    this.logger.verbose(`Operation [${dto.opPayload.opName}] requested by [${dto.opOrigin.ethereumAddress}] with: `);
    this.logger.verbose(dto.opPayload);
  }

  async setupBatch(dto: IOperation<SetupBatchDto>) {
    this.logOperation(dto);

    // will throw if not found
    const user = await this.usersService.findOneByEthereumAddress(dto.opOrigin.ethereumAddress);

    const batchId = dto.opPayload.batchId;
    const origins = [...new Set(dto.opPayload.origins)]; // avoid duplicates

    const exist = await this.pddm.findOne({ batchId });
    if (exist) throw new ConflictException(`Batch with Id ${batchId} is already set up.`);

    // lab cannot process this operation
    if (user.role === Role.LABORATORY) throw new UnauthorizedException();

    // hatchery cannot set up a batch with an origin
    if (user.role === Role.HATCHERY && origins.length > 0)
      throw new BadRequestException('A hatchery cannot set an origin.');

    // farmer and slaughterhouse must set the origin
    if (user.role === Role.FARMER || user.role === Role.SLAUGHTERHOUSE) {
      if (origins.length === 0) throw new BadRequestException('Orgin must be set.');
      // and origins must match what ancestors have declared
      for (const batchId of origins) {
        const result = await this.pddm.findOne({ batchId });
        // case 1: no-one has declared the batch, so it cannot be referenced
        if (!result) throw new BadRequestException(`Origin with batch Id ${batchId} does not exist.`);
        // case 2: someone has declared the batch, but has not declared the user as successor in the chain
        if (!result.destinations.includes(user.ethereumAddress))
          throw new UnauthorizedException(`Origin with batch Id ${batchId} did not authorized this destination.`);
      }
    }

    const productionData = new this.pddm({ user: user.ethereumAddress, batchId, origins });
    const res = await productionData.save();

    await this.notarizationService.notarize(dto);

    return res;
  }

  async releaseBatch(dto: IOperation<ReleaseBatchDto>) {
    this.logOperation(dto);

    const { batchId, destinations } = dto.opPayload;
    const { user, productionData } = await this.checkOwner(dto.opOrigin.ethereumAddress, batchId);

    // slaughterhouse cannot process this operation in the prototype
    if (user.role === Role.SLAUGHTERHOUSE)
      throw new MethodNotAllowedException('The batch release operation is not implemented for slaughterhouses.');

    // releaseBatch can be used more than once by a user (to update / fix an error for example)
    // But an update cannot omit a previously declared destination if this destination has already setup a batch with this as origin.
    // 1. are there previously declared destinations ?
    if (productionData.destinations.length > 0) {
      // 2. If yes, find among these destinations if this batchId is declared as origin
      const cmds = await this.pddm.find({
        $and: [{ user: { $in: productionData.destinations } }, { origins: batchId }],
      });
      // 3. find if a previously declared destination that cannot be omitted is omitted
      cmds.forEach(c => {
        if (!destinations.includes(c.user))
          throw new BadRequestException(
            `Cannot remove member ${c.user} from destinations because that member has already declared this batch as an origin.`
          );
      });
    }

    productionData.destinations = [...new Set(destinations)]; // avoid duplicates
    const res = productionData.save();

    await this.notarizationService.notarize(dto);

    return res;
  }

  async pushHatcheryData(dto: IOperation<HatcheryDataDto>) {
    this.logOperation(dto);

    const { batchId, ...rest } = dto.opPayload;
    const { user, productionData } = await this.checkOwner(dto.opOrigin.ethereumAddress, batchId);

    // role must be hatchery
    if (user.role !== Role.HATCHERY) throw new UnauthorizedException();

    const res = await this.pddm.findByIdAndUpdate(productionData._id, prepareUpdate('hatcheryData', rest), {
      new: true,
    });

    await this.notarizationService.notarize(dto);

    return res;
  }

  async pushFarmerData(dto: IOperation<FarmerDataDto>) {
    this.logOperation(dto);

    const { batchId, opName: _ignore, ...rest } = dto.opPayload;
    const { user, productionData } = await this.checkOwner(dto.opOrigin.ethereumAddress, batchId);

    // role must be farmer
    if (user.role !== Role.FARMER) throw new UnauthorizedException();

    const res = await this.pddm.findByIdAndUpdate(productionData._id, prepareUpdate('farmerData', rest), { new: true });

    await this.notarizationService.notarize(dto);

    return res;
  }

  async pushSlaughterHouseData(dto: IOperation<SlaughterhouseDataDto>) {
    this.logOperation(dto);

    const { batchId, ...rest } = dto.opPayload;
    const { user, productionData } = await this.checkOwner(dto.opOrigin.ethereumAddress, batchId);

    // role must be slaughterhouse
    if (user.role !== Role.SLAUGHTERHOUSE) throw new UnauthorizedException();

    const res = await this.pddm.findByIdAndUpdate(productionData._id, prepareUpdate('slaughterHouseData', rest), {
      new: true,
    });

    await this.notarizationService.notarize(dto);

    return res;
  }

  async orderAnalysis(dto: IOperation<OrderAnalysisDto>) {
    this.logOperation(dto);

    const { batchId, laboratoryEthereumAddress, orderId } = dto.opPayload;
    const { user, productionData } = await this.checkOwner(dto.opOrigin.ethereumAddress, batchId);

    // user must have a role that is allowed to order lab analysis
    if (![Role.FARMER, Role.HATCHERY, Role.SLAUGHTERHOUSE].includes(user.role as Role))
      throw new UnauthorizedException();

    try {
      // check that lab exists.
      const lab = await this.usersService.findOneByEthereumAddress(laboratoryEthereumAddress);
      // and is really a lab.
      if (lab.role !== Role.LABORATORY) throw new Error();
    } catch (e) {
      // catch both not found and bad role errors
      throw new BadRequestException(`Laboratory does not exist.`);
    }

    const idx = productionData.analysisOrders.findIndex(e => e.orderId === orderId);

    let res: ProductionData;
    if (idx > -1) {
      // order already exists
      if (productionData.analysisOrders[idx].laboratoryData.salmonellaStatus)
        throw new UnauthorizedException('Cannot change analysisOrder if laboratory already pushed results.');
      productionData.analysisOrders[idx].laboratoryEthereumAddress = laboratoryEthereumAddress;
      res = await productionData.save();
    } else {
      // new order
      productionData.analysisOrders.push({ orderId, laboratoryEthereumAddress });
      res = await productionData.save();
    }

    await this.notarizationService.notarize(dto);

    return res;
  }

  async pushLaboratoryData(dto: IOperation<LaboratoryDataDto>) {
    this.logOperation(dto);

    // will throw if user not found
    const user = await this.usersService.findOneByEthereumAddress(dto.opOrigin.ethereumAddress);
    // user must be a lab
    if (user.role !== Role.LABORATORY) throw new UnauthorizedException();

    const { batchId, orderId, ...rest } = dto.opPayload;

    const productionData = await this.pddm.findOne({ batchId });
    if (!productionData) throw new NotFoundException(`Batch with Id ${batchId} not found.`);

    const idx = productionData.analysisOrders.findIndex(
      ao => ao.orderId === orderId && ao.laboratoryEthereumAddress === user.ethereumAddress
    );
    if (idx < 0) throw new UnauthorizedException();

    const res = await this.pddm.findByIdAndUpdate(
      productionData._id,
      prepareUpdate('analysisOrders.' + idx + '.laboratoryData', rest),
      { new: true }
    );

    await this.notarizationService.notarize(dto);

    return res;
  }

  async getBatch(dto: IOperation<GetBatchDto>) {
    this.logOperation(dto);
    const { productionData } = await this.checkOwner(dto.opOrigin.ethereumAddress, dto.opPayload.batchId);
    return productionData;
  }

  private async findOrigins(productionData: ProductionData): Promise<ProductionDataDocument[]> {
    const origins: Record<string, ProductionDataDocument> = {};

    // recursive fn
    const getOrigins = async (batchIds: string[]): Promise<void> => {
      // if no batchIds in origins array => no origin
      if (batchIds.length === 0) return;
      // else find all pds that have this batchIds
      const pds = await this.pddm.find({ batchId: { $in: batchIds } });
      // found more pds than batchIds => corrupted because of unexpected duplicates on batchIds
      // found less pds than batchIds => corrupted because some users were allowed to reference an origin that does not exist
      if (pds.length !== batchIds.length) throw new Error('Corrupted database.');

      // each found pd is an origin
      const next = new Set<string>();
      pds.forEach(c => {
        origins[c.batchId] = c; // will be overriden if previously found, allowing no duplicates
        c.origins.forEach(o => next.add(o));
      });
      // search origins of each origin found
      await getOrigins([...next]);
    };
    // start recursion with origin of the current batch
    await getOrigins(productionData.origins || []);

    return Object.values(origins);
  }

  private async findDestinations(productionData: ProductionData): Promise<ProductionDataDocument[]> {
    const destinations: Record<string, ProductionDataDocument> = {};

    // recursive fn
    const getDestinations = async (batchIds: string[]): Promise<void> => {
      // if batchIds not found in other pds origins array => no destination
      if (batchIds.length === 0) return;
      // else find all pds that reference the bathIds as origin (maybe 0)
      const pds = await this.pddm.find({ origins: { $in: batchIds } });
      // each found pd is a destination
      const next = new Set<string>();
      pds.forEach(c => {
        destinations[c.batchId] = c; // will be overriden if previously found, allowing no duplicates
        next.add(c.batchId);
      });
      // search destinations from found destinations
      await getDestinations([...next]);
    };
    // start recursion with the current batch id
    await getDestinations([productionData.batchId]);

    return Object.values(destinations);
  }

  async getProductionChain(dto: IOperation<GetProductionChainDto>) {
    this.logOperation(dto);
    const { productionData } = await this.checkOwner(dto.opOrigin.ethereumAddress, dto.opPayload.batchId);
    const origins = await this.findOrigins(productionData);
    const destinations = await this.findDestinations(productionData);
    return { origins, chainMemberData: productionData, destinations };
  }

  async findNotarizations(dto: IOperation<FindNotarizationsDto>) {
    this.logOperation(dto);

    const { batchId, query } = dto.opPayload;
    const { ethereumAddress } = dto.opOrigin;

    return await this.notarizationService.findNotarizations({ batchId, userAddress: ethereumAddress, query });
  }
}
