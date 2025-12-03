import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tap, pipe, switchMap, catchError, EMPTY } from 'rxjs';
import { WebSocketService } from '../services/web-socket.service';
import {
  DashboardEvent,
  DashboardStats,
  WebSocketMessage,
  isHistoryEvent,
  isStatsEvent,
  isDashboardEvent,
} from '../models/dashboard.types';
import { DASHBOARD_CONSTANTS } from '../constants/dashboard.constants';

type TimeRange = '6h' | '12h' | '24h';

type DashboardState = {
  events: DashboardEvent[];
  stats: DashboardStats;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  timeRange: TimeRange;
};

const initialState: DashboardState = {
  events: [],
  stats: {
    totalWorkflows: 0,
    averageCycleTime: '0h',
    slaCompliance: 0,
    activeAnomalies: 0,
  },
  isConnected: false,
  isLoading: true,
  error: null,
  timeRange: '6h',
};

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    criticalCount: computed(() => store.events().filter((e) => e.severity === 'CRITICAL').length),
    recentEvents: computed(() => store.events().slice(0, DASHBOARD_CONSTANTS.RECENT_EVENTS_COUNT)),
    filteredEvents: computed(() => {
      const now = new Date();
      const range = store.timeRange();
      let hoursToSubtract: number;

      switch (range) {
        case '6h':
          hoursToSubtract = 6;
          break;
        case '24h':
          hoursToSubtract = 24;
          break;
        default:
          hoursToSubtract = 12;
      }

      const cutoffTime = new Date(now.getTime() - hoursToSubtract * 60 * 60 * 1000);

      return store.events().filter((e) => new Date(e.timestamp) > cutoffTime);
    }),
  })),

  withMethods((store, wsService = inject(WebSocketService)) => {
    let connectionStateInitialized = false;

    return {
      connect: rxMethod<void>(
        pipe(
          tap(() => {
            // Initialize connection state once
            if (!connectionStateInitialized) {
              const connectionState = wsService.getConnectionState();
              patchState(store, {
                isConnected: connectionState === 'open' || connectionState === 'connecting',
                isLoading: true,
                error: null,
              });
              connectionStateInitialized = true;
            }
          }),
          switchMap(() => {
            const connection$ = wsService.connect();
            // Update connection state when connection is established (only once)
            return connection$.pipe(
              tap(() => {
                if (wsService.isConnected() && !store.isConnected()) {
                  patchState(store, { isConnected: true, isLoading: false });
                }
              })
            );
          }),
          tap((message: WebSocketMessage) => {
            if (isHistoryEvent(message)) {
              patchState(store, { events: message.data, isLoading: false });
            } else if (isStatsEvent(message)) {
              patchState(store, { stats: message.data, isLoading: false });
            } else if (isDashboardEvent(message)) {
              // Add new event to the beginning of the array
              patchState(store, (state) => ({
                events: [message, ...state.events],
                isLoading: false,
                // Note: Stats should be updated via STATS events, not here
                // If you need to track event counts, consider computed properties instead
              }));
            }
          }),
          catchError((error) => {
            console.error('WebSocket connection error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Connection error occurred';
            patchState(store, {
              isConnected: false,
              isLoading: false,
              error: errorMessage,
            });
            connectionStateInitialized = false;
            // Return EMPTY to complete the stream on error
            // The WebSocket service handles reconnection, so this is acceptable
            return EMPTY;
          })
        )
      ),
      disconnect() {
        wsService.disconnect();
        patchState(store, { isConnected: false, isLoading: false });
        connectionStateInitialized = false;
      },
      clearError() {
        patchState(store, { error: null });
      },
      updateTimeRange(range: TimeRange) {
        patchState(store, { timeRange: range });
      },
    };
  })
);
