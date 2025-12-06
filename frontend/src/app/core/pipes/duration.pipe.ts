/**
 * @fileoverview Pipe for formatting duration in minutes into a readable string (e.g., "2h 30m").
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: true,
})
export class DurationPipe implements PipeTransform {
  /**
   * Transforms a number of minutes into a human-readable string.
   *
   * @param {number} minutes - The duration in minutes.
   * @returns {string} The formatted string (e.g., "1h 5m" or "45m"). Returns '-' if input is null/undefined.
   */
  transform(minutes: number): string {
    if (!minutes && minutes !== 0) return '-';

    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);

    if (h === 0) {
      return `${m}m`;
    }

    return `${h}h ${m}m`;
  }
}
