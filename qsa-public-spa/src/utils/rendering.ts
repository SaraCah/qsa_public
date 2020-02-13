// Example:
// Input:  YYYY-MM-DD
// Output: DD/MM/YYYY
export const formatDateForDisplay = (str: string): string => {
  return str.split('-').reverse().join('/');
};

export const preserveNewLines = (str: string): string => {
  return str ? str.replace(/(?:\\r\\n|\\r|\\n)/g, '<br/>') :  str;
};

export const toISODateString = (date: Date): string => {
  const pad = (n: number): string => {
    if (n < 10) {
      return '0' + n;
    } else {
      return '' + n;
    }
  };

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  return [year, month, day].join('-');
};

export const formatConstantForDisplay = (str: string): string => {
  return str.split('_').join(' ');
};

export const rewriteISODates = (str: string): string => {
  if (!str) {
    return str;
  }

  const isoDateRegex = RegExp(/\d\d\d\d-\d\d(-\d\d)?/,'g');
  let match: any;

  while ((match = isoDateRegex.exec(str)) !== null) {
    str = str.replace(match[0], formatDateForDisplay(match[0]));
  }

  return str;
};

export const epochToDateDisplayString = (epoch: number): string => {
  return new Date(epoch).toLocaleDateString('en-au');
};

export const epochToDateTimeDisplayString = (epoch: number): string => {
  return new Date(epoch).toLocaleString('en-au');
};