import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MatCard, MatCardHeader, MatCardContent } from '@angular/material/card';
import { MatChip } from '@angular/material/chips';
import { DashboardStore } from '@core/store/dashboard.store';
import { formatEventTypeWithAcronyms } from '@core/utils/format.utils';
import {
  getEventStatus,
  getStatusEventLogDot,
  getStatusEventLogChip,
} from '@core/utils/event-status.utils';

@Component({
  selector: 'app-event-log',
  imports: [DatePipe, MatCard, MatCardHeader, MatCardContent, TitleCasePipe],
  templateUrl: './event-log.html',
  styleUrl: './event-log.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventLog {
  readonly store = inject(DashboardStore);
  readonly formatEventTypeWithAcronyms = formatEventTypeWithAcronyms;
  readonly getEventStatus = getEventStatus;
  readonly getStatusEventLogDot = getStatusEventLogDot;
  readonly getStatusEventLogChip = getStatusEventLogChip;
}

