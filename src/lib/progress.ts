export interface ProgressGoal {
  title: string;
  startDate: string; // YYYY-MM-DD
  targetDate: string;
}

export interface MonthMarker {
  label: string;
  position: number;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
}

export interface WeekDayMarker {
  label: string;
  position: number;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
}

export interface WeekProgress {
  percent: number;
  markers: WeekDayMarker[];
  rangeLabel: string;
}

// 格式化日期為 2027/6/1
export function formatDateZh(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${y}/${m}/${d}`;
}

// 依任務時數計算進度百分比（0–100，可超過 100 由呼叫端處理）
export function getHoursProgressPercent(
  completed: number,
  required: number
): number {
  if (required <= 0) return 0;
  return Math.min(100, Math.max(0, (completed / required) * 100));
}

// 計算日曆時間進度百分比（0–100）
export function getProgressPercent(
  startDate: string,
  targetDate: string,
  now = new Date()
): number {
  const start = parseDate(startDate);
  const target = parseDate(targetDate);
  const total = target.getTime() - start.getTime();
  if (total <= 0) return 100;
  const elapsed = now.getTime() - start.getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

// 產生進度條底部每個月份標記
export function getMonthMarkers(
  startDate: string,
  targetDate: string,
  now = new Date()
): MonthMarker[] {
  const start = parseDate(startDate);
  const target = parseDate(targetDate);
  const total = target.getTime() - start.getTime();
  if (total <= 0) return [];

  const markers: MonthMarker[] = [];
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(target.getFullYear(), target.getMonth(), 1);
  const todayMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  while (current <= endMonth) {
    const position = ((current.getTime() - start.getTime()) / total) * 100;
    const isPast = current < todayMonth;
    const isCurrent =
      current.getFullYear() === todayMonth.getFullYear() &&
      current.getMonth() === todayMonth.getMonth();

    markers.push({
      label: `${current.getMonth() + 1}月`,
      position: Math.min(100, Math.max(0, position)),
      isPast,
      isCurrent,
      isFuture: current > todayMonth,
    });

    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }

  return markers;
}

// 本週進度（週一～週日）
export function getWeekProgress(now = new Date()): WeekProgress {
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const total = sunday.getTime() - monday.getTime();
  const elapsed = now.getTime() - monday.getTime();
  const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));

  const dayLabels = ["一", "二", "三", "四", "五", "六", "日"];
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const markers: WeekDayMarker[] = dayLabels.map((label, i) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);

    const isPast = dayDate < todayStart;
    const isCurrent = dayDate.getTime() === todayStart.getTime();

    return {
      label,
      position: i === 0 ? 0 : i === 6 ? 100 : (i / 6) * 100,
      isPast,
      isCurrent,
      isFuture: dayDate > todayStart,
    };
  });

  const rangeLabel = `${monday.getMonth() + 1}/${monday.getDate()} – ${sunday.getMonth() + 1}/${sunday.getDate()}`;

  return { percent, markers, rangeLabel };
}

// 起程日到抵達日的總週數
export function getWeekCount(startDate: string, targetDate: string): number {
  const start = parseDate(startDate);
  const target = parseDate(targetDate);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const diff = target.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / msPerWeek));
}

// 週目標 = (所有所需時間 - 已完成時間) / 週次
export function getWeeklyHourGoal(
  totalRequired: number,
  totalCompleted: number,
  startDate: string,
  targetDate: string
): number {
  const remaining = Math.max(0, totalRequired - totalCompleted);
  const weeks = getWeekCount(startDate, targetDate);
  return Math.round((remaining / weeks) * 10) / 10;
}

export const DEFAULT_PROGRESS_GOAL: ProgressGoal = {
  title: "成為自由教練",
  startDate: "2025-06-01",
  targetDate: "2027-06-01",
};

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}
