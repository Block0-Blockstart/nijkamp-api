import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LaboratoryData, LaboratoryDataSchema } from './laboratory-data.schema';

@Schema()
export class AnalysisOrder {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  laboratoryEthereumAddress: string;

  @Prop({ type: LaboratoryDataSchema })
  laboratoryData?: LaboratoryData;
}

export const AnalysisOrderSchema = SchemaFactory.createForClass(AnalysisOrder);

export type AnalysisOrderDocument = HydratedDocument<AnalysisOrder>;
