import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'duration'})
export class DurationPipe implements PipeTransform {
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
