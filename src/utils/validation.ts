namespace App {
  type Validatable = {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    max?: number;
    min?: number;
  };

  // Functions
  export function validate(validatable: Validatable) {
    const {
      value: prevValue,
      required,
      minLength,
      maxLength,
      min,
      max,
    } = validatable;

    let isValid: boolean = true;
    let value = prevValue;

    const isString = typeof value === "string";
    const isNumber = typeof value === "number";

    const hasMinLength = minLength != null;
    const hasMaxLength = maxLength != null;

    const hasMin = min != null;
    const hasMax = max != null;

    if (required) {
      isValid = value.toString().length > 0;
    }

    if (isString) {
      value = value.toString().trim();

      if (hasMinLength) {
        isValid = value.length > minLength;
      }

      if (hasMaxLength) {
        isValid = value.length < maxLength;
      }
    }

    if (isNumber) {
      value = Number(value);

      if (hasMin) {
        isValid = value > min;
      }

      if (hasMax) {
        isValid = value < max;
      }
    }

    return isValid;
  }
}
