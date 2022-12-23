import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AnalysisOrder, AnalysisOrderSchema } from './analysis-order.schema';
import { FarmerData, FarmerDataSchema } from './farmer-data.schema';
import { HatcheryData, HatcheryDataSchema } from './hatchery-data.schema';
import { SlaughterHouseData, SlaughterHouseDataSchema } from './slaughterhouse-data.schema';

// collection name will be "production-data"
@Schema({ collection: 'production-data' })
export class ProductionData {
  @Prop({ required: true })
  user: string; // eth address of the user sharing his production data

  @Prop({ required: true })
  batchId: string; // the batch id used internally by the user and that will be communicated to the successor on the delivery order

  @Prop()
  origins?: string[]; // origins are the batch ids from one or more ancestors (in case of aggregation)

  @Prop()
  destinations?: string[]; // destinations are eth addresses of the users that come next on the user's production chain (one or more in case of batch split)

  @Prop({ type: HatcheryDataSchema })
  hatcheryData?: HatcheryData; // data shared by the user if and only if he has hatchery role

  @Prop({ type: FarmerDataSchema })
  farmerData?: FarmerData; // data shared by the user if and only if he has farmer role

  @Prop({ type: SlaughterHouseDataSchema })
  slaughterHouseData?: SlaughterHouseData; // data shared by the user if and only if he has slaughterhouse role

  @Prop({ type: [AnalysisOrderSchema] })
  analysisOrders?: AnalysisOrder[]; // a list of analysis orders, to one or more laboratories. The labs will push their results in this list as well
}

export const ProductionDataSchema = SchemaFactory.createForClass(ProductionData);

export type ProductionDataDocument = HydratedDocument<ProductionData>;
