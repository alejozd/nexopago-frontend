import dayjs from 'dayjs';

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDate(value: string | Date): string {
  return dayjs(value).format('DD/MM/YYYY');
}

export function formatDateTime(value: string | Date): string {
  return dayjs(value).format('DD/MM/YYYY HH:mm');
}

export function formatMonthPeriod(periodo: string): string {
  return dayjs(`${periodo}-01`).format('MMM YYYY');
}

const compactCurrencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatCurrencyCompact(value: number): string {
  return compactCurrencyFormatter.format(value);
}
