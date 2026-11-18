const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

/** 'YYYY-MM' -> 'Mon YYYY'. */
export function formatYearMonth(ym: string): string {
  const [year = '', month = ''] = ym.split('-');
  return `${MONTHS[Number(month) - 1] ?? month} ${year}`;
}

/** 'Mon YYYY – Mon YYYY' or 'Mon YYYY – Present' (en dash U+2013). */
export function formatRange(start: string, end?: string): string {
  return `${formatYearMonth(start)} \u2013 ${end === undefined ? 'Present' : formatYearMonth(end)}`;
}
