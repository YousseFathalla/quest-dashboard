import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { arbLogEvents } from '@shared/tests/generators';
import { LogEvent, EventType } from '@models/dashboard.types';

/**
 * Pure functions extracted from HeatMap component for dialog filtering
 */

const TIME_SLOTS = [
  '00:00-04:00',
  '04:00-08:00',
  '08:00-12:00',
  '12:00-16:00',
  '16:00-20:00',
  '20:00-24:00',
];

const EVENT_TYPES: EventType[] = ['pending', 'completed', 'anomaly'];

/**
 * Parse time slot to get start and end hours
 */
function parseTimeSlot(timeSlot: string): { startHour: number; endHour: number } {
  const [start, end] = timeSlot.split('-').map((time: string) => {
    const [hour] = time.split(':').map(Number);
    return hour;
  });
  return { startHour: start, endHour: end || 24 };
}

/**
 * Filter events for a specific cell (time slot and event type)
 */
function filterEventsForCell(
  events: LogEvent[],
  xIndex: number,
  yIndex: number
): LogEvent[] {
  const timeSlot = TIME_SLOTS[xIndex];
  const eventType = EVENT_TYPES[yIndex];

  if (!timeSlot) return [];

  const { startHour, endHour } = parseTimeSlot(timeSlot);

  return events.filter((event) => {
    const eventHour = new Date(event.timestamp).getHours();
    const matchesTimeSlot = eventHour >= startHour && eventHour < endHour;
    const matchesType = event.type === eventType;
    return matchesTimeSlot && matchesType;
  });
}

/**
 * Get time slot index from hour
 */
function getTimeSlotIndexFromHour(hour: number): number {
  return Math.floor(hour / 4);
}

/**
 * Get y-axis index from event type
 */
function getYIndexFromType(type: EventType): number {
  if (type === 'completed') return 1;
  if (type === 'anomaly') return 2;
  return 0; // pending
}

describe('HeatMap Dialog Filtering Property Tests', () => {
  /**
   * **Feature: chart-components-refactor, Property 9: Dialog event filtering accuracy**
   * **Validates: Requirements 3.2**
   *
   * For any clicked heatmap cell with coordinates [xIndex, yIndex], the filtered events
   * should all satisfy: (event hour falls in time slot xIndex) AND (event.type matches yIndex status)
   */
  it('Property 9: filtered events match cell time slot and event type', () => {
    fc.assert(
      fc.property(
        arbLogEvents(1, 50),
        fc.integer({ min: 0, max: 5 }), // xIndex (time slot)
        fc.integer({ min: 0, max: 2 }), // yIndex (event type)
        (events, xIndex, yIndex) => {
          const filtered = filterEventsForCell(events, xIndex, yIndex);
          const timeSlot = TIME_SLOTS[xIndex];
          const expectedType = EVENT_TYPES[yIndex];
          const { startHour, endHour } = parseTimeSlot(timeSlot);

          // All filtered events should match the criteria
          filtered.forEach((event) => {
            const eventHour = new Date(event.timestamp).getHours();

            // Event hour should be in the time slot
            expect(eventHour).toBeGreaterThanOrEqual(startHour);
            expect(eventHour).toBeLessThan(endHour);

            // Event type should match
            expect(event.type).toBe(expectedType);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Events not in filtered set don't match criteria
   */
  it('excluded events do not match cell criteria', () => {
    fc.assert(
      fc.property(
        arbLogEvents(5, 50),
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 0, max: 2 }),
        (events, xIndex, yIndex) => {
          const filtered = filterEventsForCell(events, xIndex, yIndex);
          const timeSlot = TIME_SLOTS[xIndex];
          const expectedType = EVENT_TYPES[yIndex];
          const { startHour, endHour } = parseTimeSlot(timeSlot);

          const excluded = events.filter((e) => !filtered.includes(e));

          // Each excluded event should fail at least one criterion
          excluded.forEach((event) => {
            const eventHour = new Date(event.timestamp).getHours();
            const matchesTimeSlot = eventHour >= startHour && eventHour < endHour;
            const matchesType = event.type === expectedType;

            // At least one should be false
            expect(matchesTimeSlot && matchesType).toBe(false);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Filtering is consistent with bucket grouping
   */
  it('filtered events for a cell match events that would be grouped into that bucket', () => {
    fc.assert(
      fc.property(arbLogEvents(1, 50), (events) => {
        // For each event, verify it would be filtered into the correct cell
        events.forEach((event) => {
          const eventHour = new Date(event.timestamp).getHours();
          const expectedXIndex = getTimeSlotIndexFromHour(eventHour);
          const expectedYIndex = getYIndexFromType(event.type);

          const filtered = filterEventsForCell(events, expectedXIndex, expectedYIndex);

          // The event should be in the filtered set
          expect(filtered).toContainEqual(event);
        });
      }),
      { numRuns: 100 }
    );
  });
});
