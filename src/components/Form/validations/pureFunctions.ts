export function createValidate(func: (value: any, data?: any) => boolean, error: any) {
  return {
    validator(rule: any[], value: any, callback: (errors: any[]) => void, storeData?: any) {
      const errors = [];

      if (func(value, storeData)) {
        errors.push(error);
      }
      callback(errors);
    },
  };
}

export const isInvalidDates = (value: any[]) => {
  if (value.length !== 2) {
    return true;
  }
  return !value[0] || !value[1];
};

export const isEmptyArray = (value: any[]) => !value || value.length === 0;

export function isEmptyString(value: string) {
  if (typeof value === 'string') {
    const parts = value.split(' ').length;

    if (parts === 1) {
      return !value.length;
    }

    if (value.length - parts < 0) {
      return true;
    }
  }

  return false;
}
