/**
 * @fileoverview Event Log component.
 * Displays a list of recent events with their details, including timestamp, type, and status.
 */

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MatCard, MatCardHeader, MatCardContent } from '@angular/material/card';
import { DashboardStore } from 'app/store/dashboard.store';
import {
  getStatusEventLogDot,
  getStatusEventLogChip,
} from '@shared/utilities/event-status.utils';

@Component({
  selector: 'app-event-log',
  imports: [DatePipe, MatCard, MatCardHeader, MatCardContent, TitleCasePipe],
  templateUrl: './event-log.html',
  styleUrl: './event-log.scss',
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
