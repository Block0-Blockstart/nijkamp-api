import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Schema as SchemaTypes } from 'mongoose';

// Notarization class will create a 'notarizations' collection
@Schema()
export class Notarization {
  @Prop({ type: SchemaTypes.Types.ObjectId, required: true })
  userId: ObjectId;

  @Prop({ required: true })
  fromAddress: string;

  @Prop({ required: true })
  txHash: string;

  @Prop({ required: true })
  blockTimestamp: number;

  @Prop({ required: true })
  opToken: string;

  @Prop({ required: true })
  opTokenHash: string;

  @Prop({ type: SchemaTypes.Types.Mixed, required: true })
  opPayload: any;
}

export const NotarizationSchema = SchemaFactory.createForClass(Notarization);

export type NotarizationDocument = HydratedDocument<Notarization>;
