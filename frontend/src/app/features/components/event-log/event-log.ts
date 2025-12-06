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
  readonly store = inject(DashboardStore);
  readonly getStatusEventLogDot = getStatusEventLogDot;
  readonly getStatusEventLogChip = getStatusEventLogChip;
}

