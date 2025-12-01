import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tap, pipe, switchMap } from 'rxjs';
import { WebSocketService } from '../services/web-socket.service';
import { DashboardEvent, DashboardStats } from '../models/dashboard.types';

type TimeRange = '6h' | '12h' | '24h';

type DashboardState = {
  events: DashboardEvent[];
  stats: DashboardStats;
  isConnected: boolean;
  timeRange: TimeRange;
};

const initialState: DashboardState = {
  events: [],
  stats: {
    totalWorkflows: 0,
    averageCycleTime: '0h',
    slaCompliance: 100,
    activeAnomalies: 0,
  },
  isConnected: false,
  timeRange: '6h',
};

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // 1. COMPUTED STATE (Derived values)
  withComputed((store) => ({
    // Automatically count how many CRITICAL events we have
    criticalCount: computed(() => store.events().filter((e) => e.severity === 'CRITICAL').length),
    // Get the last 5 events for a quick list
    recentEvents: computed(() => store.events().slice(0, 5)),
    filteredEvents: computed(() => {
      const now = new Date();
      const range = store.timeRange();
      let hoursToSubtract = 12;

      if (range === '6h') hoursToSubtract = 6;
      if (range === '24h') hoursToSubtract = 24;

      const cutoffTime = new Date(now.getTime() - hoursToSubtract * 60 * 60 * 1000);

      // Return only events newer than the cutoff
      return store.events().filter((e) => new Date(e.timestamp) > cutoffTime);
    }),
  })),

  // 2. METHODS (Actions)
  withMethods((store, wsService = inject(WebSocketService)) => ({
    // The "Connect" Action
    connect: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isConnected: true })),
        switchMap(() => wsService.connect()),
        tap((newEvent) => {
          // Every time a new event arrives, we update the state
          patchState(store, (state) => ({
            // Add new event to the TOP of the list
            events: [newEvent, ...state.events],
            // Simulate updating stats live (just to show movement)
            stats: {
              ...state.stats,
              totalWorkflows: state.stats.totalWorkflows + 1,
              activeAnomalies:
                newEvent.severity === 'CRITICAL'
                  ? state.stats.activeAnomalies + 1
                  : state.stats.activeAnomalies,
            },
          }));
        })
      )
    ),
    updateTimeRange(range: TimeRange) {
      patchState(store, { timeRange: range });
    },
  }))
);
