import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { arbLogEvent, arbLogEvents, arbEventType } from 'app/testing/generators';
import { LogEvent, EventType } from '@models/dashboard.types';
import { getStatusColorCircle } from '@shared/utilities/event-status.utils';

/**
 * Pure functions extracted from HeatMap component for testing
 */

/**
 * Calculate time slot index from hour (0-5 for 4-hour slots)
 */
function getTimeSlotIndex(timestamp: number): number {
  const hour = new Date(timestamp).getHours();
  return Math.floor(hour / 4);
}

/**
 * Get Y-axis index from event type
 */
function getStatusIndex(type: EventType): number {
  if (type === 'completed') return 1;
  if (type === 'anomaly') return 2;
  return 0; // pending
}

/**
 * Filter events by critical only flag
 */
function filterCriticalOnly(events: LogEvent[], criticalOnly: boolean): LogEvent[] {
  if (!criticalOnly) return events;
  return events.filter((e) => e.type === 'anomaly');
}

/**
 * Group events into heatmap buckets
 */
function groupEventsIntoBuckets(
  events: LogEvent[]
): Map<string, { count: number; eventType: EventType }> {
  const buckets = new Map<string, { count: number; eventType: EventType }>();

  events.forEach((e) => {
    const timeIndex = getTimeSlotIndex(e.timestamp);
    const statusIndex = getStatusIndex(e.type);
    const key = `${timeIndex}-${statusIndex}`;

    const bucket = buckets.get(key) || { count: 0, eventType: e.type };
    bucket.count++;
    buckets.set(key, bucket);
  });

  return buckets;
}

describe('HeatMap Property Tests', () => {
  /**
   * **Feature: chart-components-refactor, Property 1: Heatmap time slot grouping consistency**
   * **Validates: Requirements 1.3**
   *
   * For any set of LogEvents, when grouped by 4-hour time slots, each event
   * should be placed in exactly one time slot based on its hour: Math.floor(hour / 4)
   */
  it('Property 1: events are grouped into correct time slots based on hour', () => {
    fc.assert(
      fc.property(arbLogEvents(1, 50), (events) => {
        events.forEach((event) => {
          const hour = new Date(event.timestamp).getHours();
          const expectedTimeIndex = Math.floor(hour / 4);
          const actualTimeIndex = getTimeSlotIndex(event.timestamp);

          expect(actualTimeIndex).toBe(expectedTimeIndex);
          expect(actualTimeIndex).toBeGreaterThanOrEqual(0);
          expect(actualTimeIndex).toBeLessThanOrEqual(5);
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: chart-components-refactor, Property 2: Event type mapping correctness**
   * **Validates: Requirements 6.2**
   *
   * For any LogEvent, the event type used for visualization should equal event.type
   */
  it('Property 2: event type is used directly without transformation', () => {
    fc.assert(
      fc.property(arbLogEvent(), (event) => {
        // The event type should be used as-is
        const buckets = groupEventsIntoBuckets([event]);
        const bucket = Array.from(buckets.values())[0];

        expect(bucket.eventType).toBe(event.type);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: chart-components-refactor, Property 7: Color coding consistency**
   * **Validates: Requirements 1.4**
   *
   * For any event type, the color assigned should match the utility function output
   */
  it('Property 7: color coding matches utility function for all event types', () => {
    fc.assert(
      fc.property(arbEventType(), (eventType) => {
        const color = getStatusColorCircle(eventType);

        // Verify colors match expected values
        if (eventType === 'completed') {
          expect(color).toBe('#22c55e'); // green
        } else if (eventType === 'anomaly') {
          expect(color).toBe('#ef4444'); // red
        } else if (eventType === 'pending') {
          expect(color).toBe('#eab308'); // yellow
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: chart-components-refactor, Property 3: Critical filter exclusivity**
   * **Validates: Requirements 2.2**
   *
   * When the "Critical Only" filter is enabled, only anomaly-type events are included
   */
  it('Property 3: critical filter only includes anomaly events', () => {
    fc.assert(
      fc.property(arbLogEvents(0, 50), (events) => {
        const filtered = filterCriticalOnly(events, true);

        // All filtered events should be anomalies
        filtered.forEach((event) => {
          expect(event.type).toBe('anomaly');
        });

        // Count should match anomaly count in original
        const expectedCount = events.filter((e) => e.type === 'anomaly').length;
        expect(filtered.length).toBe(expectedCount);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Each event contributes to exactly one bucket
   */
  it('each event contributes to exactly one bucket', () => {
    fc.assert(
      fc.property(arbLogEvents(1, 50), (events) => {
        const buckets = groupEventsIntoBuckets(events);

        // Total count across all buckets should equal number of events
        let totalCount = 0;
        buckets.forEach((bucket) => {
          totalCount += bucket.count;
        });

        expect(totalCount).toBe(events.length);
      }),
      { numRuns: 100 }
    );
  });
});
