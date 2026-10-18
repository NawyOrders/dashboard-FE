/** A single mock sales entry. Dates are ISO `yyyy-mm-dd` strings. */
export interface SalesRecord {
  id: string;
  /** Related tenant when known; platform-level entries may omit it. */
  tenantId?: string;
  date: string;
  /** Amount in EGP. */
  amountEgp: number;
}
