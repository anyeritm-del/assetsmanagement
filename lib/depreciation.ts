import { addMonths, differenceInCalendarDays, parseISO } from "date-fns";

export interface DepreciationPoint {
  date: string;
  bookValue: number;
}

export interface DepreciationInfo {
  startDate: Date;
  endDate: Date;
  halfLifeDate: Date;
  points: DepreciationPoint[];
}

// Straight-line depreciation from acquisitionValue at startDate down to 0 at endDate.
export function buildDepreciationInfo(
  startDateStr: string,
  endDateStr: string,
  acquisitionValue: number,
): DepreciationInfo | null {
  const startDate = parseISO(startDateStr.slice(0, 10));
  const endDate = parseISO(endDateStr.slice(0, 10));
  if (endDate <= startDate) return null;

  const totalDays = differenceInCalendarDays(endDate, startDate);
  const halfLifeDate = addMonths(startDate, Math.round(totalDays / 30.44 / 2));

  const points: DepreciationPoint[] = [];
  let cursor = startDate;
  while (cursor < endDate) {
    const elapsedDays = differenceInCalendarDays(cursor, startDate);
    const fraction = Math.min(1, elapsedDays / totalDays);
    points.push({
      date: cursor.toISOString().slice(0, 10),
      bookValue: Math.round(acquisitionValue * (1 - fraction)),
    });
    cursor = addMonths(cursor, 1);
  }
  points.push({ date: endDate.toISOString().slice(0, 10), bookValue: 0 });

  return { startDate, endDate, halfLifeDate, points };
}
