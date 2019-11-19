export const formatDateForDisplay = (str: string): string => {
    return str.split(' ').map((bit) => (
        bit.split('-').reverse().join('-')
    )).join(' ');
}

export const preserveNewLines = (str: string): string => {
  return str ? str.replace(/(?:\\r\\n|\\r|\\n)/g, '<br/>') :  str;
};
