import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotarizationModule } from '../notarizations/notarization.module';
import { UsersModule } from '../users/users.module';
import { CurrentOperationMiddleware } from './middlewares/current-operation.middleware';
import { ProductionDataController } from './production-data.controller';
import { ProductionDataService } from './production-data.service';
import { ProductionDataSchema } from './schemas/production-data.schema';

@Module({
  imports: [
    UsersModule,
    NotarizationModule,
    MongooseModule.forFeature([{ name: 'production-data', schema: ProductionDataSchema }]),
  ],
  providers: [ProductionDataService, NotarizationModule],
  exports: [ProductionDataService],
  controllers: [ProductionDataController],
})
export class ProductionDataModule implements NestModule {
  /* IMPORTANT NOTE
   * We configure the middleware to be available in EVERY ROUTE ('*'),
   * and not only routes behind this module's controller ('/user')
   * We could have define this middleware at app.module level, to be clear on the global availability.
   * BUT, middlewares use dependency injection, and this one depends on services from AuthConnectorModule
   * and from UsersModule. So, if we declare it in app.module, we must import all these module at top level.
   * Because this middleware is clearly a feature coming with user module, we decide to declare it here instead.
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentOperationMiddleware).forRoutes('*');
  }
}
