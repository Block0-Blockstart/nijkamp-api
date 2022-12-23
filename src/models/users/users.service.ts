import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Role, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dtos/request/create-user.dto';
import { UpdateUserDto } from './dtos/request/update-user.dto';
import { sanitizeRegexString } from '../../helpers/strings';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(@InjectModel('user') private usersModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    // User should not already exist.
    // It happens if there is a previous user having the same value for at least one prop marked as "unique"
    // Unique props are email, ethereumAddress, ethereumPublicKey, avinetId.
    const user = new this.usersModel({ ...dto, role: dto.role || Role.UNSET });
    try {
      const created = await user.save();
      this.logger.verbose(`Create user: ID ${created.id} created in database.`);
      return created;
    } catch (e) {
      if (e.message && e.message.split('duplicate key').length > 1) {
        const msg = `User already exists${
          e.keyValue ? ' (Duplicate on [' + Object.keys(e.keyValue).join(' ') + '])' : '.'
        }`;
        this.logger.verbose(`Create user: Rejected. ${msg}`);
        throw new ConflictException(msg);
      } else {
        this.logger.verbose(`Create user: Rejected. ${e}`);
        throw new InternalServerErrorException('Cannot create User.');
      }
    }
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    try {
      const { modifiedCount } = await this.usersModel.updateOne({ _id: this.toObjectId(id) }, dto);
      if (modifiedCount) {
        this.logger.verbose(`Update user: ID ${id} updated with: ${JSON.stringify(dto, null, 2)}`);
      } else {
        this.logger.verbose(`Update user: ID ${id}: nothing to update.`);
      }
      return await this.findOne(id);
    } catch (e) {
      if (e.message && e.message.split('duplicate key').length > 1) {
        this.logger.verbose(
          `Update user: Rejected. Duplicate on unique field${
            e.keyValue ? ' [' + Object.keys(e.keyValue).join(' ') + ']' : '.'
          }`
        );
        throw new ConflictException('Duplicate on unique field(s)');
      } else {
        this.logger.verbose(`Update user: Rejected. ${e}`);
        throw new InternalServerErrorException('Cannot update User.');
      }
    }
  }

  /**
   *
   * Finds a single user if it exists, throws if not exists.
   *
   * If 'ignoreDeleted' is false, this will also search users that are tagged as deleted.
   *
   */
  async findOne(id: string, ignoreDeleted = true): Promise<UserDocument> {
    const user = await this.usersModel.findOne({ _id: this.toObjectId(id) }).exec();
    if (!user) throw new NotFoundException('User not found');
    if (ignoreDeleted && user.deleted) throw new NotFoundException('User not found');
    return user;
  }

  /**
   *
   * Finds a single user if it exists, throws if not exists.
   *
   * If 'ignoreDeleted' is false, this will also search users that are tagged as deleted.
   *
   */
  async findOneByEthereumAddress(ethereumAddress: string, ignoreDeleted = true): Promise<UserDocument> {
    const user = await this.usersModel.findOne({ ethereumAddress }).exec();
    if (!user) throw new NotFoundException('User not found');
    if (ignoreDeleted && user.deleted) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Search by one or more criteria. If multiple criteria, there is a AND clause.
   *
   * Always ignore deleted users.
   */
  async searchBy(args: {
    companyName?: string;
    telephone?: string;
    email?: string;
    ethereumAddress?: string;
    ethereumPublicKey?: string;
    avinetId?: string;
  }): Promise<UserDocument[]> {
    const s: Record<string, any> = {};

    Object.keys(args).forEach(arg => {
      if (args[arg]) {
        if (args[arg].length < 4 || args[arg].length > 255)
          throw new BadRequestException('Search values must have min 4 chars and max 255 chars.');
        s[arg] = { $regex: sanitizeRegexString(args[arg]), $options: 'i' };
      }
    });

    if (Object.keys(s).length === 0) throw new BadRequestException('No search criteria.');

    return await this.usersModel.find({ ...s, deleted: false }).exec();
  }

  /**
   *
   * Soft delete a user (tagged as deleted).
   * If user is already tagged as deleted, he is considered not existing.
   *
   */
  async setDeleted(id: string): Promise<UserDocument> {
    const user = await this.findOne(id, true);
    user.deleted = true;
    return await user.save();
  }

  /**
   *
   * Undelete a user tagged as deleted.
   * If user is not tagged as deleted, does nothing.
   *
   */
  async unsetDeleted(id: string): Promise<UserDocument> {
    const user = await this.findOne(id, false);
    user.deleted = false;
    return await user.save();
  }

  /**
   *
   * REAL DELETE on a user, no matter if is was previously tagged as deleted or not.
   *
   */
  async dangerouslyDelete(id: string): Promise<UserDocument> {
    const user = await this.findOne(id, false); // allows throwing if not exists, and returning the deleted user
    await this.usersModel.deleteOne({ _id: this.toObjectId(id) });
    this.logger.verbose(`User ${id} deleted from database.`);
    return user;
  }

  private toObjectId(id: string): mongoose.Types.ObjectId {
    let objId: mongoose.Types.ObjectId;
    try {
      objId = new mongoose.Types.ObjectId(id);
    } catch (e) {
      throw new BadRequestException(`${id} is not a valid id.`);
    }
    return objId;
  }
}
