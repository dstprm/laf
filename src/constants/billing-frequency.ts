export interface IBillingFrequency {
  value: string;
  label: string;
  priceSuffix: string;
}

export const BillingFrequency: IBillingFrequency[] = [
  { value: 'month', label: 'Mensual', priceSuffix: 'por usuario/mes' },
  { value: 'year', label: 'Anual', priceSuffix: 'por usuario/año' },
];
