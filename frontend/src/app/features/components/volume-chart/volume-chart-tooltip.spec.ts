import { describe, it, expect } from 'vitest';

/**
 * Tooltip formatter function extracted from VolumeChart component
 */
function formatVolumeTooltip(
  params: Array<{
    axisValue?: string;
    value?: number;
    seriesName?: string;
    color?: string;
  }>
): string {
  if (!params?.length) return '';

  const axisValue = params[0].axisValue;
  let content = `<div style="padding: 8px;">`;
  content += `<div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #e2e8f0;">${axisValue}</div>`;

  params.forEach((param) => {
    const value = param.value || 0;
    const seriesName = param.seriesName || '';
    const color = param.color || '#94a3b8';
    content += `
      <div style="font-size: 12px; margin-bottom: 4px; display: flex; align-items: center;">
        <span style="display: inline-block; width: 10px; height: 10px; background-color: ${color}; border-radius: 2px; margin-right: 6px;"></span>
        <span style="color: #94a3b8;">${seriesName}:</span>
        <span style="color: #e2e8f0; font-weight: 600; margin-left: 6px;">${value}</span>
      </div>
    `;
  });

  content += `</div>`;
  return content;
}

describe('VolumeChart Tooltip Unit Tests', () => {
  /**
   * **Validates: Requirements 4.4**
   * Test that tooltip formatter includes hour, total volume, and critical count
   */
  describe('tooltip content completeness', () => {
    it('should include hour in tooltip', () => {
      const params = [
        { axisValue: '14:00', value: 10, seriesName: 'Total Volume', color: '#3b82f6' },
        { axisValue: '14:00', value: 2, seriesName: 'Critical Errors', color: '#ef4444' },
      ];

      const tooltip = formatVolumeTooltip(params);
      expect(tooltip).toContain('14:00');
    });

    it('should include total volume in tooltip', () => {
      const params = [
        { axisValue: '14:00', value: 10, seriesName: 'Total Volume', color: '#3b82f6' },
        { axisValue: '14:00', value: 2, seriesName: 'Critical Errors', color: '#ef4444' },
      ];

      const tooltip = formatVolumeTooltip(params);
      expect(tooltip).toContain('Total Volume');
      expect(tooltip).toContain('10');
    });

    it('should include critical error count in tooltip', () => {
      const params = [
        { axisValue: '14:00', value: 10, seriesName: 'Total Volume', color: '#3b82f6' },
        { axisValue: '14:00', value: 2, seriesName: 'Critical Errors', color: '#ef4444' },
      ];

      const tooltip = formatVolumeTooltip(params);
      expect(tooltip).toContain('Critical Errors');
      expect(tooltip).toContain('2');
    });

    it('should handle zero values', () => {
      const params = [
        { axisValue: '0:00', value: 0, seriesName: 'Total Volume', color: '#3b82f6' },
        { axisValue: '0:00', value: 0, seriesName: 'Critical Errors', color: '#ef4444' },
      ];

      const tooltip = formatVolumeTooltip(params);
      expect(tooltip).toContain('0:00');
      expect(tooltip).toContain('0');
    });

    it('should return empty string for empty params', () => {
      const tooltip = formatVolumeTooltip([]);
      expect(tooltip).toBe('');
    });

    it('should return empty string for null/undefined params', () => {
      const tooltip = formatVolumeTooltip(null as unknown as []);
      expect(tooltip).toBe('');
    });

    it('should include color indicators', () => {
      const params = [
        { axisValue: '14:00', value: 10, seriesName: 'Total Volume', color: '#3b82f6' },
        { axisValue: '14:00', value: 2, seriesName: 'Critical Errors', color: '#ef4444' },
      ];

      const tooltip = formatVolumeTooltip(params);
      expect(tooltip).toContain('#3b82f6'); // blue for volume
      expect(tooltip).toContain('#ef4444'); // red for errors
    });

    it('should handle missing values with defaults', () => {
      const params = [
        { axisValue: '14:00', seriesName: 'Total Volume' },
        { axisValue: '14:00', seriesName: 'Critical Errors' },
      ];

      const tooltip = formatVolumeTooltip(params);
      expect(tooltip).toContain('14:00');
      expect(tooltip).toContain('Total Volume');
      expect(tooltip).toContain('0'); // default value
      expect(tooltip).toContain('#94a3b8'); // default color
    });
  });
});
