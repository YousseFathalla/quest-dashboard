
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MatCard, MatCardHeader, MatCardContent } from '@angular/material/card';
import { DashboardStore } from 'app/store/dashboard.store';
import { getStatusEventLogDot, getStatusEventLogChip } from '@shared/utilities/event-status.utils';
import { SkeletonLoader } from '@shared/components/skeleton-loader/skeleton-loader';

/**
 * @fileoverview Event Log component.
 * Displays a list of recent events with their details, including timestamp, type, and status.
 */
@Component({
  selector: 'app-event-log',
  imports: [DatePipe, MatCard, MatCardHeader, MatCardContent, TitleCasePipe, SkeletonLoader],
  templateUrl: './event-log.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventLog {
  /** The dashboard store. */
  readonly store = inject(DashboardStore);
  /** Utility function to get CSS class for status dot. */
  readonly getStatusEventLogDot = getStatusEventLogDot;
  /** Utility function to get CSS class for status chip. */
  readonly getStatusEventLogChip = getStatusEventLogChip;
}
