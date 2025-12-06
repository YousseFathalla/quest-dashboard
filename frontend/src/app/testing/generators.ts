import * as fc from 'fast-check';
import { LogEvent, EventType, Severity } from '@models/dashboard.types';

/**
 * Arbitrary generator for EventType values
 */
export const arbEventType = (): fc.Arbitrary<EventType> =>
  fc.constantFrom<EventType>('completed', 'pending', 'anomaly');

/**
 * Arbitrary generator for Severity values
 */
export const arbSeverity = (): fc.Arbitrary<Severity> =>
  fc.oneof(
    fc.constantFrom<'normal' | 'high'>('normal', 'high'),
    fc.integer({ min: 1, max: 10 })
  );

/**
 * Arbitrary generator for timestamps within a reasonable range (last 24 hours)
 */
export const arbTimestamp = (): fc.Arbitrary<number> => {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  return fc.integer({ min: oneDayAgo, max: now });
};

/**
 * Arbitrary generator for LogEvent objects
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
 * Arbitrary generator for arrays of LogEvents
 */
export const arbLogEvents = (
  minLength = 0,
  maxLength = 100
): fc.Arbitrary<LogEvent[]> =>
  fc.array(arbLogEvent(), { minLength, maxLength });

/**
 * Arbitrary generator for time range values
 */
export const arbTimeRange = (): fc.Arbitrary<'6h' | '12h' | '24h'> =>
  fc.constantFrom('6h', '12h', '24h');

/**
 * Arbitrary generator for hour values (0-23)
 */
export const arbHour = (): fc.Arbitrary<number> =>
  fc.integer({ min: 0, max: 23 });

/**
 * Generate a timestamp for a specific hour today
 */
export const timestampForHour = (hour: number): number => {
  const now = new Date();
  now.setHours(hour, 0, 0, 0);
  return now.getTime();
};

/**
 * Arbitrary generator for LogEvent with a specific hour
 */
export const arbLogEventAtHour = (hour: number): fc.Arbitrary<LogEvent> =>
  fc.record({
    id: fc.uuid(),
    timestamp: fc.constant(timestampForHour(hour)),
    type: arbEventType(),
    severity: fc.option(arbSeverity(), { nil: undefined }),
    cycleTime: fc.option(fc.integer({ min: 100, max: 10000 }), { nil: undefined }),
  });
