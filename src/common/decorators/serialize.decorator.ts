import { UseInterceptors } from '@nestjs/common';
import { IClass } from '../../interfaces/IClass';
import MongooseClassSerializerInterceptor from '../interceptors/mongooseClassSerializer.interceptor';

// sugar code decorator to use instead of declaring this long code when we use the interceptor:
// @UseInterceptors(MongooseClassSerializerInterceptor(User))
export const Serialize = (classToIntercept: IClass) => {
  return UseInterceptors(MongooseClassSerializerInterceptor(classToIntercept));
};
