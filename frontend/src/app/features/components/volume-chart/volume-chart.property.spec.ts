import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { arbLogEvent, arbLogEvents, arbTimeRange } from 'app/testing/generators';
import { LogEvent } from '@models/dashboard.types';

/**
 * Pure functions extracted from VolumeChart component for testing
 */

type TimeRange = '6h' | '12h' | '24h';

/**
 * Filter events by time range
 */
function filterEventsByTimeRange(
  events: LogEvent[],
  range: TimeRange,
  currentTime: number = Date.now()
): LogEvent[] {
  const hoursMap: Record<TimeRange, number> = {
    '6h': 6,
    '12h': 12,
    '24h': 24,
  };
  const hours = hoursMap[range];
  const cutoffTimestamp = currentTime - hours * 3600000;
  return events.filter((e) => e.timestamp >= cutoffTimestamp);
}

/**
 * Get hour label from timestamp
 */
function getHourLabel(timestamp: number): string {
  return new Date(timestamp).getHours() + ':00';
}

/**
 * Aggregate events by hour
 */
function aggregateByHour(
  events: LogEvent[]
): Map<string, { total: number; critical: number }> {
  const volumeMap = new Map<string, { total: number; critical: number }>();

  events.forEach((e) => {
    const hourLabel = getHourLabel(e.timestamp);
    const current = volumeMap.get(hourLabel) || { total: 0, critical: 0 };

    current.total++;
    if (e.type === 'anomaly') current.critical++;

    volumeMap.set(hourLabel, current);
  });

  return volumeMap;
}

describe('VolumeChart Property Tests', () => {
  /**
   * **Feature: chart-components-refactor, Property 4: Time range filter correctness**
   * **Validates: Requirements 5.2, 7.2, 7.3, 7.4**
   *
   * For any time range selection and current timestamp, an event should be included
   * if and only if: event.timestamp >= (currentTimestamp - rangeInMilliseconds)
   */
  it('Property 4: time range filter correctly includes/excludes events', () => {
    fc.assert(
      fc.property(
        arbLogEvents(0, 50),
        arbTimeRange(),
        fc.integer({ min: Date.now() - 1000, max: Date.now() + 1000 }),
        (events, range, currentTime) => {
          const hoursMap: Record<TimeRange, number> = {
            '6h': 6,
            '12h': 12,
            '24h': 24,
          };
          const hours = hoursMap[range];
          const cutoffTimestamp = currentTime - hours * 3600000;

          const filtered = filterEventsByTimeRange(events, range, currentTime);

          // All filtered events should be >= cutoff
          filtered.forEach((event) => {
            expect(event.timestamp).toBeGreaterThanOrEqual(cutoffTimestamp);
          });

          // All excluded events should be < cutoff
          const excluded = events.filter((e) => !filtered.includes(e));
          excluded.forEach((event) => {
            expect(event.timestamp).toBeLessThan(cutoffTimestamp);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: chart-components-refactor, Property 5: Hourly aggregation uniqueness**
   * **Validates: Requirements 4.5**
   *
   * For any set of LogEvents, when aggregated by hour, each event should contribute
   * to exactly one hour bucket
   */
  it('Property 5: each event contributes to exactly one hour bucket', () => {
    fc.assert(
      fc.property(arbLogEvents(1, 50), (events) => {
        const volumeMap = aggregateByHour(events);

        // Total count across all buckets should equal number of events
        let totalCount = 0;
        volumeMap.forEach((bucket) => {
          totalCount += bucket.total;
        });

        expect(totalCount).toBe(events.length);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Critical count matches anomaly events
   */
  it('critical count equals number of anomaly events per hour', () => {
    fc.assert(
      fc.property(arbLogEvents(1, 50), (events) => {
        const volumeMap = aggregateByHour(events);

        // Total critical count should equal anomaly events
        let totalCritical = 0;
        volumeMap.forEach((bucket) => {
          totalCritical += bucket.critical;
        });

        const expectedCritical = events.filter((e) => e.type === 'anomaly').length;
        expect(totalCritical).toBe(expectedCritical);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Hour label format is consistent
   */
  it('hour labels are in correct format (H:00)', () => {
    fc.assert(
      fc.property(arbLogEvent(), (event) => {
        const hourLabel = getHourLabel(event.timestamp);
        const hour = new Date(event.timestamp).getHours();

        expect(hourLabel).toBe(`${hour}:00`);
        expect(hourLabel).toMatch(/^\d{1,2}:00$/);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Time range cutoff calculation is correct
   */
  it('time range cutoff is calculated correctly', () => {
    fc.assert(
      fc.property(
        arbTimeRange(),
        fc.integer({ min: Date.now() - 1000, max: Date.now() + 1000 }),
        (range, currentTime) => {
          const hoursMap: Record<TimeRange, number> = {
            '6h': 6,
            '12h': 12,
            '24h': 24,
          };
          const hours = hoursMap[range];
          const expectedCutoff = currentTime - hours * 3600000;

          // Create an event exactly at the cutoff - should be included
          const eventAtCutoff: LogEvent = {
            id: 'test',
            timestamp: expectedCutoff,
            type: 'completed',
          };

          const filtered = filterEventsByTimeRange([eventAtCutoff], range, currentTime);
          expect(filtered.length).toBe(1);

          // Create an event 1ms before cutoff - should be excluded
          const eventBeforeCutoff: LogEvent = {
            id: 'test2',
            timestamp: expectedCutoff - 1,
            type: 'completed',
          };

          const filtered2 = filterEventsByTimeRange([eventBeforeCutoff], range, currentTime);
          expect(filtered2.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
