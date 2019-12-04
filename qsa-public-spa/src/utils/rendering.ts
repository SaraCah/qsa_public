export const formatDateForDisplay = (str: string): string => {
    return str.split(' ').map((bit) => (
        bit.split('-').reverse().join('-')
    )).join(' ');
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