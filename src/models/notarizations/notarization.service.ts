import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Contract, Wallet } from 'ethers';
import { Model } from 'mongoose';
import { AppConfigService } from '../../config/app/app.config.service';
import { keccak256 } from '../../helpers/hash';
import { ContractsService } from '../../services/contracts/contracts.service';
import { IOperation } from '../operations/middlewares/current-operation.middleware';
import { NotarizationDocument } from './schemas/notarizations.schema';
import { UsersService } from '../users/users.service';
import { sanitizeRegexString } from '../../helpers/strings';
import { isFiniteNumber, isString } from '../../helpers/typechecking';

export interface IVerifyFromHashArgs {
  opTokenHash: string;
  fromAddress: string;
}

export type IVerifyResult = Array<{ timestamp: number; txHash: string; opTokenHash: string }>;

export interface IFindNotarizationsArgs {
  batchId: string;
  userAddress: string;
  query: Record<string, string | number>;
}

@Injectable()
export class NotarizationService {
  private readonly logger = new Logger('NotarizationService');
  private readonly wallet: Wallet;
  private readonly contract: Contract;

  constructor(
    private readonly acs: AppConfigService,
    private readonly cs: ContractsService,
    private readonly us: UsersService,
    @InjectModel('notarizations') private notarizationModel: Model<NotarizationDocument>
  ) {
    this.wallet = new Wallet(this.acs.ADMIN_KEY, this.cs.getProvider());
    this.contract = this.cs.getContractInstance('notarization', this.acs.NOTARIZATION_CONTRACT_ADDRESS, this.wallet);
  }

  /**
   * Notarize operation in blockchain and record in database.
   */
  async notarize(operation: IOperation<any>) {
    const { opOrigin, opToken, opPayload } = operation;
    const { ethereumAddress } = opOrigin;

    const opTokenHash = keccak256(opToken);

    const { blockNumber, transactionHash } = await this.cs.sendTx(() =>
      this.contract.notarize(ethereumAddress, opTokenHash)
    );
    const { timestamp } = await this.cs.getProvider().getBlock(blockNumber);
    const { _id } = await this.us.findOneByEthereumAddress(ethereumAddress);

    const notarization = new this.notarizationModel({
      userId: _id,
      fromAddress: ethereumAddress,
      txHash: transactionHash,
      blockTimestamp: timestamp,
      opToken,
      opTokenHash,
      opPayload,
    });

    try {
      await notarization.save();
    } catch (err) {
      const msg =
        'Error while saving notarized operation in database. Database will be desynchronized with blockchain.';
      this.logger.error(msg);
      console.error(err);
      throw new InternalServerErrorException(msg);
    }
  }

  /**
   * Verify that an operation was previously recorded in blockchain.
   */
  async verifyFromHash({ opTokenHash, fromAddress }: IVerifyFromHashArgs): Promise<IVerifyResult> {
    try {
      const filter = this.contract.filters.Notarized(fromAddress, opTokenHash);
      const events = await this.contract.queryFilter(filter);
      return await Promise.all(
        events.map(async evt => ({
          timestamp: (await evt.getBlock()).timestamp,
          txHash: evt.transactionHash,
          opTokenHash,
        }))
      );
    } catch (e) {
      const msg = 'Unable to verify operation on blockchain.';
      this.logger.error(msg);
      console.error(e);
      throw new InternalServerErrorException(msg);
    }
  }

  /**
   * Verify that an operation was previously recorded in blockchain.
   */
  async verify(operation: IOperation<any>): Promise<IVerifyResult> {
    return this.verifyFromHash({
      opTokenHash: keccak256(operation.opToken),
      fromAddress: operation.opOrigin.ethereumAddress,
    });
  }

  /**
   * Search notarization collection.
   */
  async findNotarizations({ batchId, userAddress, query }: IFindNotarizationsArgs): Promise<NotarizationDocument[]> {
    const s: Record<string, any> = {};

    Object.keys(query).forEach(arg => {
      if (query[arg]) {
        if (isString(query[arg])) {
          s['opPayload.' + arg] = { $regex: sanitizeRegexString(query[arg] as string), $options: 'i' }; //i = case insensitive
        } else if (isFiniteNumber(query[arg])) {
          s['opPayload.' + arg] = query[arg];
        } else throw new BadRequestException('History can be searched only for string or number values, not nested.');
      }
    });
    if (Object.keys(s).length === 0) throw new BadRequestException('No search criteria.');

    return await this.notarizationModel.find({ ...s, 'opPayload.batchId': batchId, fromAddress: userAddress }).exec();
  }
}
