import { ValidationError } from 'class-validator';

/**
 * Converts class-validator array or errors to a single error string.
 *
 */
export function parseValidationErrors(errors: ValidationError[]): string | null {
  if (!errors || errors.length === 0) return null;

  try {
    return errors
      .map(e =>
        e.constraints
          ? Object.keys(e.constraints)
              .map(ck => e.constraints[ck])
              .join(', ')
          : e.toString()
      )
      .join(' --- ');
  } catch (e) {
    return 'DTO validation error.';
  }
}
