import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class SlaughterHouseData {
  @Prop()
  race?: string;

  @Prop()
  units?: number;

  @Prop()
  slaughterDate?: number;

  @Prop()
  farmerHousing?: string;

  @Prop()
  farmerSetupDate?: number;
}

export const SlaughterHouseDataSchema = SchemaFactory.createForClass(SlaughterHouseData);

export type SlaughterhouseDataDocument = HydratedDocument<SlaughterHouseData>;
