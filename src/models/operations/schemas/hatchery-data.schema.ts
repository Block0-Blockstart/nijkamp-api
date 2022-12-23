import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class HatcheryData {
  @Prop()
  race?: string;

  @Prop()
  units?: number;

  @Prop()
  breederId?: string;

  @Prop()
  hatcheryKipId?: string;

  @Prop()
  farmerSetupDate?: number;
}

export const HatcheryDataSchema = SchemaFactory.createForClass(HatcheryData);

export type HatcheryDataDocument = HydratedDocument<HatcheryData>;
