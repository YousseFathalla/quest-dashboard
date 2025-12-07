import { LogEvent } from '@models/dashboard.types';

// Severity levels 1-5 (1=low, 5=critical)
export const SEVERITY_LEVELS = [1, 2, 3, 4, 5];
export const SEVERITY_LABELS = ['Sev 1', 'Sev 2', 'Sev 3', 'Sev 4', 'Sev 5'];

// Severity-based colors (lighter to darker red)
export const SEVERITY_COLORS: Record<number, string> = {
  1: '#fecaca', // red-200
  2: '#fca5a5', // red-300
  3: '#f87171', // red-400
  4: '#ef4444', // red-500
  5: '#dc2626', // red-600
};

export interface TimeSlot {
  label: string;
  startTime: number;
  endTime: number;
}

/**
 * Generates 24 dynamic 1-hour time slots covering the past 24 hours.
 */
export function generateTimeSlots(): TimeSlot[] {
  const now = new Date();
  // Align to the next hour boundary to get flat numbers (e.g. 4:20 -> 5:00)
  now.setHours(now.getHours() + 1);
  now.setMinutes(0, 0, 0);
  const endOfCurrentWindow = now.getTime();

  const slots: TimeSlot[] = [];
  const slotDuration = 1 * 60 * 60 * 1000; // 1 hour in ms

  // Generate 24 slots going back 24 hours from the aligned end time
  for (let i = 23; i >= 0; i--) {
    const endTime = endOfCurrentWindow - i * slotDuration;
    const startTime = endTime - slotDuration;

    const startDate = new Date(startTime);

    const formatTime = (d: Date) =>
      `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

    slots.push({
      label: formatTime(startDate), // Just show start time e.g. "14:00"
      startTime,
      endTime,
    });
  }

  return slots;
}

export function formatTooltip(params: unknown): string {
  const p = params as { data?: { value?: [number, number, number, number, string] } };
  if (!p.data) return '';
  const dataValue = p.data.value;
  if (!dataValue) return '';
  const [, severityIndex, count, , timeSlotLabel] = dataValue;
  const severity = SEVERITY_LEVELS[severityIndex];

  return `
    <div class="p-2">
      <div class="mb-2 text-sm font-semibold text-slate-200">
        ${count} ${count === 1 ? 'Anomaly' : 'Anomalies'}
      </div>
      <div class="mb-1 text-xs text-slate-400">
        <span class="font-medium">Time:</span> ${timeSlotLabel}
      </div>
      <div class="pt-2 mt-2 text-xs border-t border-slate-700">
        <span class="font-medium text-slate-400">Severity:</span>
        <span class="ml-1 font-semibold text-red-400">Level ${severity}</span>
      </div>
    </div>
  `;
}

export function processAnomalyEvents(events: LogEvent[], timeSlots: TimeSlot[]) {
  // Only process anomaly events
  const anomalies = events.filter((e) => e.type === 'anomaly');

  const buckets = new Map<
    string,
    { count: number; severity: number; slotLabel: string }
  >();

  anomalies.forEach((e: LogEvent) => {
    // Find which time slot this event belongs to
    const slotIndex = timeSlots.findIndex(
      (slot) => e.timestamp >= slot.startTime && e.timestamp < slot.endTime
    );

    if (slotIndex === -1) return; // Event outside 24h window

    // Get severity (default to 1 if not set)
    const severity = typeof e.severity === 'number' ? e.severity : 1;
    const severityIndex = Math.min(Math.max(severity - 1, 0), 4); // 0-4 index

    const key = `${slotIndex}-${severityIndex}`;
    const bucket = buckets.get(key) || {
      count: 0,
      severity,
      slotLabel: timeSlots[slotIndex].label,
    };
    bucket.count++;
    buckets.set(key, bucket);
  });


  const heatmapData = Array.from(buckets.entries()).map(([key, bucket]) => {
    const [x, y] = key.split('-').map(Number);
    const severity = SEVERITY_LEVELS[y];
    return {
      value: [x, y, bucket.count, severity, bucket.slotLabel] as [
        number,
        number,
        number,
        number,
        string,
      ],
      itemStyle: {
        color: SEVERITY_COLORS[severity] || SEVERITY_COLORS[1],
      },
    };
  });

  return heatmapData;
}

export interface HeatmapCellData {
  slot: TimeSlot;
  filteredEvents: LogEvent[];
}

export function getHeatmapCellData(
  params: unknown,
  timeSlots: TimeSlot[],
  allEvents: LogEvent[]
): HeatmapCellData | null {
  const p = params as { data?: { value?: [number, number, number, number, string] } };
  if (!p.data?.value) return null;

  const [xIndex, yIndex] = p.data.value;
  const severity = SEVERITY_LEVELS[yIndex];

  // Use the dynamic time slots
  const slot = timeSlots[xIndex];
  if (!slot) return null;

  // Filter anomalies by time slot and severity
  const filteredEvents = allEvents.filter((event: LogEvent) => {
    if (event.type !== 'anomaly') return false;
    const matchesTimeSlot = event.timestamp >= slot.startTime && event.timestamp < slot.endTime;
    const eventSeverity = typeof event.severity === 'number' ? event.severity : 1;
    const matchesSeverity = eventSeverity === severity;
    return matchesTimeSlot && matchesSeverity;
  });

  if (filteredEvents.length === 0) return null;

  return { slot, filteredEvents };
}
