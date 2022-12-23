import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Transform } from 'class-transformer';
import { HydratedDocument, ObjectId } from 'mongoose';

export enum Role {
  ADMIN = 'ADMIN',
  FARMER = 'FARMER',
  HATCHERY = 'HATCHERY',
  SLAUGHTERHOUSE = 'SLAUGHTERHOUSE',
  LABORATORY = 'LABORATORY',
  UNSET = 'UNSET',
}

export function rolesToObject(): Record<string, string> {
  const result = {};
  Object.entries(Role).map(([key, value]) => Object.assign(result, { [key]: value }));
  return result;
}

export function rolesToArray(): string[] {
  return Object.values(Role);
}

// note1: transform and exclude are applied when class-transformer is called
// note2: by default, when mongoose fetches entities, it does not return instances
// of User, so that class-transformer does not apply. So we need to create a
// custom class serializer that intercepts the returned user and converts it
// to a User instance. See MongooseClassSerializerInterceptor.

// User class will create a 'users' collection
@Schema()
export class User {
  @Transform(value => value.obj._id.toString())
  _id: ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, type: String, enum: rolesToArray() })
  role: string;

  @Prop({ required: false })
  ethereumAddress: string;

  @Prop({ required: false })
  ethereumPublicKey: string;

  @Prop({ required: false })
  avinetId: string;

  @Prop({ required: false })
  companyName: string;

  @Prop({ required: false })
  telephone: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: false })
  @Exclude()
  deleted: boolean;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index(
  { ethereumAddress: 1 },
  { unique: true, partialFilterExpression: { ethereumAddress: { $type: 'string', $gt: '', $exists: true } } }
);

UserSchema.index(
  { ethereumPublicKey: 1 },
  { unique: true, partialFilterExpression: { ethereumPublicKey: { $type: 'string', $gt: '', $exists: true } } }
);

UserSchema.index(
  { avinetId: 1 },
  { unique: true, partialFilterExpression: { avinetId: { $type: 'string', $gt: '', $exists: true } } }
);

export type UserDocument = HydratedDocument<User>;

export { UserSchema };
