
import { seedInitialData, randomType, randomSeverity, updateMetrics } from '../simulation/generator.js';
import { store } from '../data/store.js';

describe('Generator', () => {
    beforeEach(() => {
        store.events = [];
        store.anomalies = [];
        store.overview = {};
    });

    it('seedInitialData should populate store with 200 events', () => {
        seedInitialData();
        expect(store.events.length).toBe(200);
        // Anomalies count varies, but should be consistent with generator logic
        expect(store.anomalies.length).toBeLessThanOrEqual(200);
        expect(store.overview).toBeDefined();
    });

    it('randomType should return valid types', () => {
        const type = randomType();
        expect(['completed', 'pending', 'anomaly']).toContain(type);
    });

    it('randomSeverity should return value between 1 and 5', () => {
        const severity = randomSeverity();
        expect(severity).toBeGreaterThanOrEqual(1);
        expect(severity).toBeLessThanOrEqual(5);
    });

    it('updateMetrics should update store.overview', () => {
        store.events.push({ type: 'completed', cycleTime: 10, timestamp: Date.now() });
        updateMetrics();
        expect(store.overview.totalWorkflowsToday).toBe(1);
    });
});
