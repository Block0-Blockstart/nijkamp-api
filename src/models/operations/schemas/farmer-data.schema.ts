import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class FarmerData {
  @Prop()
  race?: string;

  @Prop()
  units?: number;

  @Prop()
  farmerHousing?: string;

  @Prop()
  farmerKipId?: string;

  @Prop()
  farmerSetupDate?: number;
}

export const FarmerDataSchema = SchemaFactory.createForClass(FarmerData);

export type FarmerDataDocument = HydratedDocument<FarmerData>;
