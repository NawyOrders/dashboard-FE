const egpFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

/** Reference prices are shown as plain EGP amounts — no tax, totals or invoices. */
export function formatEgp(amount: number): string {
  return `${egpFormatter.format(amount)} EGP`;
}
