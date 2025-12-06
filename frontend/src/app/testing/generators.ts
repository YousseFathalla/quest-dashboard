/**
 * @fileoverview Property-based testing generators using fast-check.
 * Provides arbitrary generators for domain models like LogEvents, Timestamps, and Severities.
 */

import * as fc from 'fast-check';
import { LogEvent, EventType, Severity } from '@models/dashboard.types';

/**
 * Arbitrary generator for EventType values.
 * @returns {fc.Arbitrary<EventType>} Generator for 'completed', 'pending', or 'anomaly'.
 */
export const arbEventType = (): fc.Arbitrary<EventType> =>
  fc.constantFrom<EventType>('completed', 'pending', 'anomaly');

/**
 * Arbitrary generator for Severity values.
 * @returns {fc.Arbitrary<Severity>} Generator for 'normal', 'high', or integer 1-10.
 */
export const arbSeverity = (): fc.Arbitrary<Severity> =>
  fc.oneof(
    fc.constantFrom<'normal' | 'high'>('normal', 'high'),
    fc.integer({ min: 1, max: 10 })
  );

/**
 * Arbitrary generator for timestamps within the last 24 hours.
 * @returns {fc.Arbitrary<number>} Generator for timestamps (ms).
 */
export const arbTimestamp = (): fc.Arbitrary<number> => {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  return fc.integer({ min: oneDayAgo, max: now });
};

/**
 * Arbitrary generator for LogEvent objects.
 * @returns {fc.Arbitrary<LogEvent>} Generator for LogEvent objects.
 */
export const arbLogEvent = (): fc.Arbitrary<LogEvent> =>
  fc.record({
    id: fc.uuid(),
    timestamp: arbTimestamp(),
    type: arbEventType(),
    severity: fc.option(arbSeverity(), { nil: undefined }),
    cycleTime: fc.option(fc.integer({ min: 100, max: 10000 }), { nil: undefined }),
  });

/**
 * Arbitrary generator for arrays of LogEvents.
 * @param {number} [minLength=0] - Minimum length of the array.
 * @param {number} [maxLength=100] - Maximum length of the array.
 * @returns {fc.Arbitrary<LogEvent[]>} Generator for arrays of LogEvent.
 */
export const arbLogEvents = (
  minLength = 0,
  maxLength = 100
): fc.Arbitrary<LogEvent[]> =>
  fc.array(arbLogEvent(), { minLength, maxLength });

/**
 * Arbitrary generator for time range values.
 * @returns {fc.Arbitrary<'6h' | '12h' | '24h'>} Generator for time range strings.
 */
export const arbTimeRange = (): fc.Arbitrary<'6h' | '12h' | '24h'> =>
  fc.constantFrom('6h', '12h', '24h');

/**
 * Arbitrary generator for hour values (0-23).
 * @returns {fc.Arbitrary<number>} Generator for integers 0-23.
 */
export const arbHour = (): fc.Arbitrary<number> =>
  fc.integer({ min: 0, max: 23 });

/**
 * Generate a timestamp for a specific hour today.
 * @param {number} hour - The hour (0-23).
 * @returns {number} The timestamp in ms.
 */
export const timestampForHour = (hour: number): number => {
  const now = new Date();
  now.setHours(hour, 0, 0, 0);
  return now.getTime();
};

/**
 * Arbitrary generator for LogEvent occurring at a specific hour.
 * @param {number} hour - The hour (0-23).
 * @returns {fc.Arbitrary<LogEvent>} Generator for LogEvent.
 */
export const arbLogEventAtHour = (hour: number): fc.Arbitrary<LogEvent> =>
  fc.record({
    id: fc.uuid(),
    timestamp: fc.constant(timestampForHour(hour)),
    type: arbEventType(),
    severity: fc.option(arbSeverity(), { nil: undefined }),
    cycleTime: fc.option(fc.integer({ min: 100, max: 10000 }), { nil: undefined }),
  });
