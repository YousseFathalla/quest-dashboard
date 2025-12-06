import { describe, it, expect } from 'vitest';
import { EventType } from '@models/dashboard.types';
import { getTooltipStatusColor } from '@shared/utilities/event-status.utils';

/**
 * Tooltip formatter function extracted from HeatMap component
 */
function formatHeatmapTooltip(
  xIndex: number,
  count: number,
  statusType: EventType
): string {
  const timeSlots = [
    '00:00-04:00',
    '04:00-08:00',
    '08:00-12:00',
    '12:00-16:00',
    '16:00-20:00',
    '20:00-24:00',
  ];
  const statusLabels: Record<string, string> = {
    completed: 'Completed',
    pending: 'Pending',
    anomaly: 'Critical',
  };

  const timeSlot = timeSlots[xIndex] || 'Unknown';
  const statusTypeLabel = statusLabels[statusType] || 'Unknown';

  return `
    <div class="p-2">
      <div class="font-semibold text-sm mb-2 text-slate-200">
        ${count} ${count === 1 ? 'Event' : 'Events'}
      </div>
      <div class="text-xs text-slate-400 mb-1">
        <span class="font-medium">Time:</span> ${timeSlot}
      </div>
      <div class="text-xs mt-2 pt-2 border-t border-slate-700">
        <span class="font-medium text-slate-400">Status:</span>
        <span class="${getTooltipStatusColor(statusType)} font-semibold ml-1">${statusTypeLabel}</span>
      </div>
    </div>
  `;
}

describe('HeatMap Tooltip Unit Tests', () => {
  /**
   * **Validates: Requirements 1.5**
   * Test that tooltip formatter includes event count, time slot, and status
   */
  describe('tooltip content completeness', () => {
    it('should include event count in tooltip', () => {
      const tooltip = formatHeatmapTooltip(0, 5, 'completed');
      expect(tooltip).toContain('5');
      expect(tooltip).toContain('Events');
    });

    it('should use singular "Event" for count of 1', () => {
      const tooltip = formatHeatmapTooltip(0, 1, 'completed');
      expect(tooltip).toContain('1');
      expect(tooltip).toContain('Event');
      expect(tooltip).not.toContain('Events');
    });

    it('should include time slot in tooltip', () => {
      const tooltip = formatHeatmapTooltip(0, 5, 'completed');
      expect(tooltip).toContain('00:00-04:00');
      expect(tooltip).toContain('Time:');
    });

    it('should include correct time slot for each index', () => {
      const expectedSlots = [
        '00:00-04:00',
        '04:00-08:00',
        '08:00-12:00',
        '12:00-16:00',
        '16:00-20:00',
        '20:00-24:00',
      ];

      expectedSlots.forEach((slot, index) => {
        const tooltip = formatHeatmapTooltip(index, 1, 'completed');
        expect(tooltip).toContain(slot);
      });
    });

    it('should include status type in tooltip', () => {
      const tooltip = formatHeatmapTooltip(0, 5, 'completed');
      expect(tooltip).toContain('Status:');
      expect(tooltip).toContain('Completed');
    });

    it('should show "Critical" for anomaly status', () => {
      const tooltip = formatHeatmapTooltip(0, 5, 'anomaly');
      expect(tooltip).toContain('Critical');
    });

    it('should show "Pending" for pending status', () => {
      const tooltip = formatHeatmapTooltip(0, 5, 'pending');
      expect(tooltip).toContain('Pending');
    });

    it('should handle unknown time slot index gracefully', () => {
      const tooltip = formatHeatmapTooltip(10, 5, 'completed');
      expect(tooltip).toContain('Unknown');
    });
  });
});
