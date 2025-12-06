/**
 * @fileoverview Main state management store for the Dashboard using NgRx SignalStore.
 * Handles data fetching, real-time updates via SSE, and state mutations.
 */

import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
  withComputed,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, switchMap, take, retry, catchError } from 'rxjs/operators';
import { EMPTY, forkJoin, of, pipe, timer } from 'rxjs';
import { connectSSE } from '@core/tools/sse-stream';
import {
  LogEvent,
  OverviewStats,
  DashboardState,
  DashboardFilter,
  ConnectionState,
} from '@models/dashboard.types';
import { env } from '@env/environment';
import { calculateStateFromEvent } from './dashboard-helper';
import { ConnectionService } from '@core/services/connection.service';
import { AnomalyNotificationService } from '@core/services/anomaly-notification.service';

const initialState: DashboardState = {
  events: [],
  stats: {
    slaCompliance: 0,
    cycleTime: 0,
    activeAnomalies: 0,
    totalWorkflowsToday: 0,
  },
  loading: true,
  filter: 'all',
  connectionState: 'connecting',
  isPaused: false,
  isStreamActive: true,
};

/**
 * The DashboardStore manages the application state.
 * It uses NgRx Signals for reactivity and state management.
 */
export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // 1. COMPUTED (Selectors)
  withComputed(({ events, filter }) => ({
    /**
     * Computed signal returning the list of events filtered by the current filter setting.
     */
    visibleEvents: computed(() => {
      const currentFilter = filter();
      const allEvents = events();
      return currentFilter === 'all'
        ? allEvents
        : allEvents.filter((e) => e.type === currentFilter);
    }),
    /**
     * Computed signal returning the total count of anomalies in the current event list.
     */
    anomalyCount: computed(() =>
      events().filter((e) => e.type === 'anomaly').length
    ),
  })),

  // 2. METHODS (Actions)
  withMethods((store) => {
      const http = inject(HttpClient);
      const connectionService = inject(ConnectionService);
      const anomalyNotifications = inject(AnomalyNotificationService);

      /**
       * Updates the connection state and triggers appropriate notifications.
       *
       * @param {ConnectionState} state - The new connection state.
       */
      const setConnectionState = (state: ConnectionState) => {
        const current = store.connectionState();
        if (state === current) return;

        patchState(store, { connectionState: state });

        if (state === 'connected') {
          connectionService.showConnected();
        } else if (state === 'disconnected') {
          connectionService.showDisconnected();
        }
      };

      // Load initial snapshot - does NOT affect connected state
      // Only the stream determines if we're "LIVE"
      /**
       * Fetches the initial data snapshot (stats and history) from the backend.
       * Retries on failure and handles loading state.
       */
      const loadSnapshot = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap(() =>
            forkJoin({
              stats: http.get<OverviewStats>(`${env.baseUrl}/stats/overview`),
              history: http.get<LogEvent[]>(`${env.baseUrl}/stats/timeline`),
            }).pipe(
              tap(({ stats, history }) => {
                patchState(store, {
                  stats,
                  events: history,
                  loading: false,
                });
              }),
              retry({
                count: 10,
                delay: () => {
                  patchState(store, { loading: false });
                  return timer(1000).pipe(take(1));
                },
              }),
              catchError(() => {
                patchState(store, { loading: false });
                return of(null);
              })
            )
          )
        )
      );

      /**
       * Connects to the SSE stream for real-time updates.
       * Manages reconnection logic and updates state on new events.
       *
       * @param {boolean} isActive - Whether the stream should be active.
       */
      const connectLiveStream = rxMethod<boolean>(
        pipe(
          switchMap((isActive) => {
            if (!isActive) {
              patchState(store, { connectionState: 'disconnected' });
              return EMPTY;
            }

            patchState(store, { connectionState: 'connecting' });

            return connectSSE<LogEvent>(`${env.baseUrl}/stream`, {
              onOpen: () => {
                setConnectionState('connected');
                loadSnapshot();
              },
              onError: () => setConnectionState('disconnected'),
            }).pipe(
              tap((newEvent) => {
                patchState(store, (state) =>
                  calculateStateFromEvent(state, newEvent)
                );
                if (!store.isPaused() && newEvent.type === 'anomaly') {
                  anomalyNotifications.notify(newEvent);
                }
              }),
              retry({
                delay: (err) => {
                  console.error('Stream disconnected, retrying in 5s...', err);
                  setConnectionState('disconnected');
                  return timer(5000).pipe(take(1));
                },
              })
            );
          })
        )
      );

      /**
       * Simulates a network error by disconnecting and reconnecting the stream.
       * Used for demonstration or testing purposes.
       */
      const simulateError = rxMethod<void>(
        pipe(
          switchMap(() => {
            patchState(store, { isStreamActive: false });
            setConnectionState('disconnected');
            connectLiveStream(false);

            return timer(10000).pipe(
              take(1),
              tap(() => {
                patchState(store, { isStreamActive: true });
                setConnectionState('connecting');
                connectLiveStream(true);
              })
            );
          })
        )
      );

      return {
        /**
         * Sets the dashboard filter.
         * @param {DashboardFilter} filter - The filter to apply.
         */
        setFilter(filter: DashboardFilter) {
          patchState(store, { filter });
        },

        /**
         * Toggles the pause state of the live stream.
         */
        togglePause() {
          const nextIsPaused = !store.isPaused();
          patchState(store, {
            isPaused: nextIsPaused,
            isStreamActive: !nextIsPaused,
          });
          connectLiveStream(!nextIsPaused);
        },

        /**
         * Sets the stream active state.
         * @param {boolean} isActive - Whether the stream is active.
         */
        setStreamActive(isActive: boolean) {
          patchState(store, { isStreamActive: isActive });
          connectLiveStream(isActive);
        },

        simulateError,

        /**
         * Refreshes the dashboard data by reloading the snapshot and reconnecting the stream.
         */
        refresh() {
          patchState(store, { loading: true });
          loadSnapshot();
          connectLiveStream(store.isStreamActive());
        },

        // Load initial snapshot - does NOT affect connected state
        // Only the stream determines if we're "LIVE"
        loadSnapshot,

        connectLiveStream,
      };
    }
  ),

  // 3. HOOKS
  withHooks({
    /**
     * Lifecycle hook called when the store is initialized.
     * Loads the initial snapshot and connects to the live stream.
     */
    onInit(store) {
      store.loadSnapshot();
      store.connectLiveStream(store.isStreamActive());
    },
  })
);
