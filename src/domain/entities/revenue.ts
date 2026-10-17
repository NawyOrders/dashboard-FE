/** A single mock revenue entry. Dates are ISO `yyyy-mm-dd` strings. */
export interface RevenueRecord {
  id: string;
  /** Related tenant when known; platform-level entries may omit it. */
  tenantId?: string;
  date: string;
  /** Amount in EGP. */
  amountEgp: number;
}
