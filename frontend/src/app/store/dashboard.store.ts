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

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // 1. COMPUTED (Selectors)
  withComputed(({ events, filter }) => ({
    visibleEvents: computed(() => {
      const currentFilter = filter();
      const allEvents = events();
      return currentFilter === 'all'
        ? allEvents
        : allEvents.filter((e) => e.type === currentFilter);
    }),
    anomalyCount: computed(() =>
      events().filter((e) => e.type === 'anomaly').length
    ),
  })),

  // 2. METHODS (Actions)
  withMethods((store) => {
      const http = inject(HttpClient);
      const connectionService = inject(ConnectionService);
      const anomalyNotifications = inject(AnomalyNotificationService);

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
        setFilter(filter: DashboardFilter) {
          patchState(store, { filter });
        },

        togglePause() {
          const nextIsPaused = !store.isPaused();
          patchState(store, {
            isPaused: nextIsPaused,
            isStreamActive: !nextIsPaused,
          });
          connectLiveStream(!nextIsPaused);
        },

        setStreamActive(isActive: boolean) {
          patchState(store, { isStreamActive: isActive });
          connectLiveStream(isActive);
        },

        simulateError,

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
    onInit(store) {
      store.loadSnapshot();
      store.connectLiveStream(store.isStreamActive());
    },
  })
);


