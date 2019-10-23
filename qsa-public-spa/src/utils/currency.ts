export const centsToString = (cents: number): string => {
  const dollars = Math.floor(cents / 100);
  const remaining_cents = cents % 100;

  const padded_cents = remaining_cents < 10 ? `0${remaining_cents}` : `${remaining_cents}`;

  return `$${dollars}.${padded_cents}`;
};
