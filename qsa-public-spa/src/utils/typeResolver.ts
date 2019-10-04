const PathMappingForType: { [name: string]: string } = {
  agent_corporate_entity: '/agencies/',
  resource: '/series/',
  archival_object: '/items/',
  mandate: '/mandates/',
  function: '/functions/'
};

const LabelForType: { [name: string]: string } = {
  agent_corporate_entity: 'Agency',
  resource: 'Series',
  archival_object: 'Item',
  mandate: 'Mandate',
  function: 'Function'
};

const IconForType: { [name: string]: string } = {
  agent_corporate_entity: 'fa fa-building',
  resource: 'fa fa-folder-open',
  archival_object: 'fa fa-file',
  mandate: 'fa fa-legal',
  function: 'fa fa-clipboard'
};

const ErrorForCode: { [name: string]: string } = {
  REQUIRED_VALUE_MISSING: "Can't be blank",
  CONFIRM_PASSWORD_MISMATCH: 'Must match Confirm Password',
  INCORRECT_PASSWORD: 'Incorrect Password'
};

export const uriFor = (qsaIDPrefixed: string, recordType: string): string => {
  return PathMappingForType[recordType] + qsaIDPrefixed;
};

export const labelForType = (recordType: string): string => {
  return LabelForType[recordType];
};

export const iconForType = (recordType: string): string => {
  return IconForType[recordType];
};

export const uppercaseInitials = (str: string): string => {
  return str
    .split(' ')
    .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
};

export const snakeToUppercaseInitials = (s: string): string => {
  return s
    .split('_')
    .map(uppercaseInitials)
    .join(' ');
};

export const labelForRelator = (relator: string): string => {
  return snakeToUppercaseInitials(relator);
};

export const labelForMandateType = (type: string): string => {
  return uppercaseInitials(type);
};

export const errorMessageForCode = (code: string): string => {
  return ErrorForCode[code] || code;
};
