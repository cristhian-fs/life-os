interface PurchaseTimelineEntry {
  month: Date;
  created: number;
  purchased: number;
}

export function buildPurchaseTimeline(
  createdRows: Array<{ month: Date; count: number }>,
  purchasedRows: Array<{ month: Date; count: number }>,
  year: number,
): PurchaseTimelineEntry[] {
  const createdMap = new Map(
    createdRows.map((r) => [r.month.getUTCMonth(), r.count]),
  );
  const purchasedMap = new Map(
    purchasedRows.map((r) => [r.month.getUTCMonth(), r.count]),
  );

  return Array.from({ length: 12 }, (_, monthIndex) => ({
    month: new Date(Date.UTC(year, monthIndex, 1)),
    created: createdMap.get(monthIndex) ?? 0,
    purchased: purchasedMap.get(monthIndex) ?? 0,
  }));
}
