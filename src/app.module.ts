import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigModule } from './config/app/app.config.module';
import { AppConfigService } from './config/app/app.config.service';
import { ProductionDataModule } from './models/operations/production-data.module';
import { UsersModule } from './models/users/users.module';
import { ChainProviderModule } from './services/chain-provider/chain-provider.module';

@Module({
  imports: [
    AppConfigModule,
    ChainProviderModule.forRootAsync({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [], // AppConfigModule is available globaly once imported in App.module
      inject: [AppConfigService],
      useFactory: (cs: AppConfigService) => ({ uri: cs.MONGODB_URI }),
    }),
    ProductionDataModule,
    UsersModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      //whitelist true means that extra props (not included in DTOs) are removed from body/params before reaching our controllers
      useValue: new ValidationPipe({ whitelist: true }),
    },
  ],
})
export class AppModule {}
