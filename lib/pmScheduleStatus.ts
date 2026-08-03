import { addDays, addMonths, addWeeks, addYears, differenceInCalendarDays, parseISO } from "date-fns";
import type { PMFrequencyUnit, PMScheduleDueStatus } from "./constants";
import type { PMSchedule } from "./types";

const DUE_SOON_WINDOW_DAYS = 30;

function addInterval(date: Date, interval: number, unit: PMFrequencyUnit): Date {
  switch (unit) {
    case "day":
      return addDays(date, interval);
    case "week":
      return addWeeks(date, interval);
    case "month":
      return addMonths(date, interval);
    case "year":
      return addYears(date, interval);
  }
}

export function getNextDueDate(schedule: PMSchedule): Date {
  const base = parseISO(schedule.last_run_date ?? schedule.start_date);
  return addInterval(base, schedule.frequency_interval, schedule.frequency_unit);
}

export function getPMScheduleDueStatus(
  schedule: PMSchedule,
  today: Date = new Date(),
): PMScheduleDueStatus {
  const daysUntilDue = differenceInCalendarDays(getNextDueDate(schedule), today);
  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue <= DUE_SOON_WINDOW_DAYS) return "due_soon";
  return "upcoming";
}
