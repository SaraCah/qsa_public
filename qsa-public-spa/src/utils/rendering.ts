export const preserveNewLines = (str: string): string => {
  return str ? str.replace(/(?:\\r\\n|\\r|\\n)/g, '<br/>') :  str;
};