import * as fc from 'fast-check';
import { arbLogEvents } from '@shared/tests/generators';
import {
  processAnomalyEvents,
  generateTimeSlots,
  SEVERITY_COLORS,
} from '@shared/utilities/heat-map.utils';
import { LogEvent } from '@models/dashboard.types';

// Helper functions to reduce nesting
const verifyHeatMapItem = (item: any, slots: any[], validAnomalies: LogEvent[]) => {
  const [xIndex, yIndex, count] = item.value;
  const slot = slots[xIndex as number];

  const matchingEvents = validAnomalies.filter((e) => {
    const inSlot = e.timestamp >= slot.startTime && e.timestamp < slot.endTime;
    const s = typeof e.severity === 'number' ? e.severity : 1;
    const sIndex = Math.min(Math.max(s - 1, 0), 4);
    return inSlot && sIndex === yIndex;
  });

  expect(count).toBe(matchingEvents.length);
};

const verifyHeatMapProperty = (events: LogEvent[]) => {
  const slots = generateTimeSlots();
  const minTime = Math.min(...slots.map((s) => s.startTime));
  const maxTime = Math.max(...slots.map((s) => s.endTime));

  const heatmapData = processAnomalyEvents(events, slots);

  const validAnomalies = events.filter(
    (e) => e.type === 'anomaly' && e.timestamp >= minTime && e.timestamp < maxTime
  );

  const totalMappedCount = heatmapData.reduce((sum, item) => sum + item.value[2], 0);

  expect(totalMappedCount).toBe(validAnomalies.length);

  heatmapData.forEach((item) => verifyHeatMapItem(item, slots, validAnomalies));
};

describe('HeatMap Property Tests', () => {
  /**
   * **Feature: chart-components-refactor**
   * **Validates: Time slot generation**
   */
  it('generateTimeSlots produces 24 one-hour slots', () => {
    const slots = generateTimeSlots();
    expect(slots.length).toBe(24);

    // Check they are consecutive 1-hour slots
    for (let i = 0; i < slots.length - 1; i++) {
      const current = slots[i];
      expect(current.endTime - current.startTime).toBe(3600000);
    }
  });

  /**
   * **Feature: chart-components-refactor**
   * **Validates: Event filtering and aggregation**
   *
   * Events processed should only include anomalies and be correctly binned.
   */
  it('processAnomalyEvents correctly bins events into time slots and severities', () => {
    fc.assert(fc.property(arbLogEvents(1, 100), verifyHeatMapProperty));
  });

  /**
   * **Feature: chart-components-refactor**
   * **Validates: Severity Colors**
   */
  it('uses correct colors for severity levels', () => {
    const slots = generateTimeSlots();
    // specific mock event
    const event: LogEvent = {
      id: '1',
      type: 'anomaly',
      timestamp: slots[0].startTime + 1000, // inside first slot
      severity: 4,
    };

    const heatmapData = processAnomalyEvents([event], slots);
    expect(heatmapData.length).toBe(1);

    // Check color
    const item = heatmapData[0];
    const severity = 4;
    expect(item.itemStyle.color).toBe(SEVERITY_COLORS[severity]);
  });
});
