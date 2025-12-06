import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { env } from '@env/environment';
import { LogEvent, OverviewStats } from '@models/dashboard.types';
import { connectSSE } from '@core/tools/sse-stream';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);

  getStats(): Observable<OverviewStats> {
    return this.http.get<OverviewStats>(`${env.baseUrl}/stats/overview`);
  }

  getTimelineHistory(): Observable<LogEvent[]> {
    return this.http.get<LogEvent[]>(`${env.baseUrl}/stats/timeline`);
  }

  connectToStream(options: {
    onOpen: () => void;
    onError: () => void;
  }): Observable<LogEvent> {
    return connectSSE<LogEvent>(`${env.baseUrl}/stream`, options);
  }
}
