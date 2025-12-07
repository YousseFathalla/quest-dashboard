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
import { tap, switchMap, take, retry, catchError } from 'rxjs/operators';
import { EMPTY, of, pipe, timer } from 'rxjs';
import { DashboardFilter, ConnectionState } from '@models/dashboard.types';
import { calculateStateFromEvent } from './dashboard-helper';
import { ConnectionService } from '@core/services/connection.service';
import { AnomalyNotificationService } from '@core/services/anomaly-notification.service';
import { DashboardService } from '@core/services/dashboard.service';
import { initialState } from './dashboard.slice';

/**
 * The DashboardStore manages the application state.
 * It uses NgRx Signals for reactivity and state management.
 */
export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // 1. COMPUTED (Selectors)
  withComputed(({ events, filter }) => ({
    // Computed signal returning the list of events filtered by the current filter setting.
    visibleEvents: computed(() => {
      const currentFilter = filter();
      const allEvents = events();
      return currentFilter === 'all'
        ? allEvents
        : allEvents.filter((e) => e.type === currentFilter);
    }),
    // Computed signal returning the total count of anomalies in the current event list.
    anomalyCount: computed(() => events().filter((e) => e.type === 'anomaly').length),
  })),

  // 2. METHODS (Actions)
  withMethods((store) => {
    const dashboardService = inject(DashboardService);
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
    const loadSnapshot = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          dashboardService.getSnapshot().pipe(
            // delay(2000), // Keep the user-requested delayed response
            tap(({ overview, events }) => {
              patchState(store, {
                stats: overview,
                // Sort events descending (Newest first) so prepend logic in helper works correctly
                events: [...events].sort((a, b) => b.timestamp - a.timestamp),
                loading: false,
              });
            }),
            retry({
              count: 3, // Reduced retry count for faster feedback
              delay: (_, retryCount) => {
                // Only keep loading state true, don't flicker false
                return timer(1000 * retryCount).pipe(take(1));
              },
            }),
            catchError((err) => {
              console.error('Failed to load snapshot', err);
              patchState(store, {
                loading: false,
                error: 'Failed to load dashboard data. Please check your connection.',
              });
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

          return dashboardService
            .connectToStream({
              onOpen: () => {
                setConnectionState('connected');
                loadSnapshot();
              },
              onError: () => setConnectionState('disconnected'),
            })
            .pipe(
              tap((newEvent) => {
                patchState(store, (state) => calculateStateFromEvent(state, newEvent));
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

      refresh() {
        patchState(store, { loading: true });
        connectLiveStream(store.isStreamActive());
      },
      // Load initial snapshot - does NOT affect connected state
      // Only the stream determines if we're "LIVE"
      simulateError,
      loadSnapshot,
      connectLiveStream,
    };
  }),

  // 3. HOOKS
  withHooks({
    onInit(store) {
      store.connectLiveStream(store.isStreamActive());
    },
  })
);
