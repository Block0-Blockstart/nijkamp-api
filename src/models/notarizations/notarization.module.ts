import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContractsModule } from '../../services/contracts/contracts.module';
import { NotarizationSchema } from './schemas/notarizations.schema';
import { UsersModule } from '../users/users.module';
import { NotarizationService } from './notarization.service';

@Module({
  imports: [
    ContractsModule,
    UsersModule,
    MongooseModule.forFeature([{ name: 'notarizations', schema: NotarizationSchema }]),
  ],
  providers: [NotarizationService],
  exports: [NotarizationService],
})
export class NotarizationModule {}
