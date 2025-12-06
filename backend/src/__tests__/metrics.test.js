
import { computeOverview, computeVolumePerHour, computeHeatmapCells } from '../simulation/metrics.js';

describe('Metrics Utils', () => {
  describe('computeOverview', () => {
    it('should return default values for empty store', () => {
      const store = { events: [], anomalies: [] };
      const overview = computeOverview(store);
      expect(overview).toEqual({
        slaCompliance: 100,
        cycleTime: 0,
        activeAnomalies: 0,
        totalWorkflowsToday: 0
      });
    });

    it('should calculate metrics correctly', () => {
      const store = {
        events: [
          { type: 'completed', cycleTime: 10, timestamp: Date.now() },
          { type: 'completed', cycleTime: 20, timestamp: Date.now() },
          { type: 'anomaly', timestamp: Date.now() }
        ],
        anomalies: [
          { type: 'anomaly', timestamp: Date.now() }
        ]
      };

      const overview = computeOverview(store);

      // Total workflows = 3
      expect(overview.totalWorkflowsToday).toBe(3);

      // Active anomalies = 1
      expect(overview.activeAnomalies).toBe(1);

      // Cycle time = (10 + 20) / 2 = 15
      expect(overview.cycleTime).toBe(15);

      // SLA Compliance: 2 non-anomalies / 3 total = 66.66% -> 67%
      expect(overview.slaCompliance).toBe(67);
    });
  });

  describe('computeVolumePerHour', () => {
      it('should bucket events by hour', () => {
          const now = new Date();
          const currentHour = now.getHours();
          const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

          const store = {
              events: [
                  { type: 'completed', timestamp: now.getTime() },
                  { type: 'pending', timestamp: now.getTime() },
                  { type: 'anomaly', timestamp: oneHourAgo.getTime() }
              ]
          };

          const volume = computeVolumePerHour(store, 2); // check last 2 hours

          const currentBucket = volume.find(b => b.hour === currentHour);
          expect(currentBucket).toBeDefined();
          expect(currentBucket.completed).toBe(1);
          expect(currentBucket.pending).toBe(1);
          expect(currentBucket.anomaly).toBe(0);

          const previousBucket = volume.find(b => b.hour === oneHourAgo.getHours());
          if (previousBucket) {
             expect(previousBucket.anomaly).toBe(1);
          }
      });
  });

  describe('computeHeatmapCells', () => {
      it('should count anomalies by hour and severity', () => {
           const now = new Date();
           const hour = now.getHours();
           const store = {
               anomalies: [
                   { timestamp: now.getTime(), severity: 1 },
                   { timestamp: now.getTime(), severity: 1 },
                   { timestamp: now.getTime(), severity: 5 }
               ]
           };

           const cells = computeHeatmapCells(store);

           const cell1 = cells.find(c => c.hour === hour && c.severity === 1);
           expect(cell1).toBeDefined();
           expect(cell1.count).toBe(2);

           const cell2 = cells.find(c => c.hour === hour && c.severity === 5);
           expect(cell2).toBeDefined();
           expect(cell2.count).toBe(1);
      });
  });
});
