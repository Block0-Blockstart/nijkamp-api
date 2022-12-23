import { ClassSerializerInterceptor, PlainLiteralObject, Type } from '@nestjs/common';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { Document } from 'mongoose';

// see https://wanago.io/2021/08/23/api-nestjs-relationships-mongodb/
// ! for the _id, this will work only if the schema applies a transfrom wwith: @Transform((value) => value.obj._id.toString())

function MongooseClassSerializerInterceptor(classToIntercept: Type): typeof ClassSerializerInterceptor {
  return class Interceptor extends ClassSerializerInterceptor {
    private changePlainObjectToClass(document: PlainLiteralObject) {
      if (!(document instanceof Document)) {
        return document;
      }
      return plainToInstance(classToIntercept, document.toJSON());
    }

    private prepareResponse(response: PlainLiteralObject | PlainLiteralObject[]) {
      if (Array.isArray(response)) {
        return response.map(this.changePlainObjectToClass);
      }
      return this.changePlainObjectToClass(response);
    }

    serialize(response: PlainLiteralObject | PlainLiteralObject[], options: ClassTransformOptions) {
      return super.serialize(this.prepareResponse(response), options);
    }
  };
}

export default MongooseClassSerializerInterceptor;
