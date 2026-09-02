/**
 * Utility functions for validating and formatting Brazilian CNPJ numbers.
 */

export function sanitizeCNPJ(cnpj: string): string {
  return (cnpj || '').replace(/\D/g, '');
}

export function formatCNPJ(cnpj: string): string {
  const clean = sanitizeCNPJ(cnpj);
  if (clean.length !== 14) return cnpj;
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function isValidCNPJ(cnpj: string): boolean {
  const clean = sanitizeCNPJ(cnpj);

  if (clean.length !== 14) return false;

  // Reject known invalid repetitive numbers
  if (/^(\d)\1{13}$/.test(clean)) return false;

  // Validate 1st verification digit
  let size = clean.length - 2;
  let numbers = clean.substring(0, size);
  const digits = clean.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += Number(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(0))) return false;

  // Validate 2nd verification digit
  size = size + 1;
  numbers = clean.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += Number(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(1))) return false;

  return true;
}
