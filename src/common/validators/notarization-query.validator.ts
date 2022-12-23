import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isNotarizationQuery } from '../../helpers/typechecking';
import { IClass } from '../../interfaces/IClass';

@ValidatorConstraint({ async: false })
class IsNotarizationQueryConstraint implements ValidatorConstraintInterface {
  validate(value: any, _validationArguments?: ValidationArguments): boolean {
    return isNotarizationQuery(value);
  }
  defaultMessage?(_validationArguments?: ValidationArguments): string {
    return '$property must be a flat key/value object where values are numbers or non-empty strings (no array or nested object).';
  }
}

export const IsNotarizationQuery = (validationOptions?: ValidationOptions): PropertyDecorator => {
  return (obj: IClass, propertyName: string) => {
    registerDecorator({
      name: 'NK_IS_NOTARIZATION_QUERY',
      target: obj.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotarizationQueryConstraint,
    });
  };
};
