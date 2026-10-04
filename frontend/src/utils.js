const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Format a number or numeric string as USD. */
export const formatPrice = (value) => currency.format(Number(value));
