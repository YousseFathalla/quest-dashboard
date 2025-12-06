import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';

/**
 * Debounce utility for testing
 * This simulates the debounce behavior used in both HeatMap and VolumeChart components
 */
function createDebouncedUpdater(debounceMs: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let updateCount = 0;
  let lastValue: unknown = null;

  return {
    update(value: unknown) {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        updateCount++;
        lastValue = value;
        timeout = null;
      }, debounceMs);
    },
    getUpdateCount() {
      return updateCount;
    },
    getLastValue() {
      return lastValue;
    },
    cleanup() {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
    },
    hasPendingUpdate() {
      return timeout !== null;
    },
  };
}

describe('Debounce Property Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * **Feature: chart-components-refactor, Property 6: Debounce prevents redundant updates**
   * **Validates: Requirements 6.4, 8.1, 8.2**
   *
   * For any sequence of rapid store updates within 300ms, the chart should update
   * exactly once after the final update in the sequence
   */
  it('Property 6: rapid updates result in single chart update', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 2, maxLength: 20 }),
        (values) => {
          const DEBOUNCE_MS = 300;
          const updater = createDebouncedUpdater(DEBOUNCE_MS);

          // Simulate rapid updates (all within debounce window)
          values.forEach((value, index) => {
            updater.update(value);
            // Advance time by less than debounce period between updates
            if (index < values.length - 1) {
              vi.advanceTimersByTime(DEBOUNCE_MS / 2);
            }
          });

          // Before debounce completes, no updates should have occurred
          expect(updater.getUpdateCount()).toBe(0);

          // After debounce period, exactly one update should occur
          vi.advanceTimersByTime(DEBOUNCE_MS);
          expect(updater.getUpdateCount()).toBe(1);

          // The last value should be used
          expect(updater.getLastValue()).toBe(values[values.length - 1]);

          updater.cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Updates separated by more than debounce period trigger multiple updates
   */
  it('updates separated by debounce period trigger separate updates', () => {
    const DEBOUNCE_MS = 300;
    const updater = createDebouncedUpdater(DEBOUNCE_MS);

    // First update
    updater.update(1);
    vi.advanceTimersByTime(DEBOUNCE_MS);
    expect(updater.getUpdateCount()).toBe(1);

    // Second update after debounce period
    updater.update(2);
    vi.advanceTimersByTime(DEBOUNCE_MS);
    expect(updater.getUpdateCount()).toBe(2);

    // Third update after debounce period
    updater.update(3);
    vi.advanceTimersByTime(DEBOUNCE_MS);
    expect(updater.getUpdateCount()).toBe(3);

    updater.cleanup();
  });

  /**
   * Test: Cleanup cancels pending updates
   */
  it('cleanup cancels pending debounced updates', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (value) => {
        const DEBOUNCE_MS = 300;
        const updater = createDebouncedUpdater(DEBOUNCE_MS);

        updater.update(value);
        expect(updater.hasPendingUpdate()).toBe(true);

        // Cleanup before debounce completes
        updater.cleanup();
        expect(updater.hasPendingUpdate()).toBe(false);

        // Advance time - no update should occur
        vi.advanceTimersByTime(DEBOUNCE_MS * 2);
        expect(updater.getUpdateCount()).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Debounce uses correct timing constant
   */
  it('debounce respects the configured delay', () => {
    const DEBOUNCE_MS = 300; // DASHBOARD_CONSTANTS.CHART_UPDATE_DEBOUNCE_MS
    const updater = createDebouncedUpdater(DEBOUNCE_MS);

    updater.update(1);

    // Just before debounce period - no update
    vi.advanceTimersByTime(DEBOUNCE_MS - 1);
    expect(updater.getUpdateCount()).toBe(0);

    // At debounce period - update occurs
    vi.advanceTimersByTime(1);
    expect(updater.getUpdateCount()).toBe(1);

    updater.cleanup();
  });
});
