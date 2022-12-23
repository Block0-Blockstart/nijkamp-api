import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class LaboratoryData {
  @Prop()
  testingDate?: number;

  @Prop({ required: true })
  salmonellaStatus: string;
}

export const LaboratoryDataSchema = SchemaFactory.createForClass(LaboratoryData);

export type LaboratoryDataDocument = HydratedDocument<LaboratoryData>;
