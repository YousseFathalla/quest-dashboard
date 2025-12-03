import { Injectable, isDevMode } from '@angular/core';

@Injectable({ providedIn: 'root'})
export class LoggerService {
  error(message: string, error?: unknown): void {
    if (isDevMode()) {
      if (error) {
        console.error(`[ERROR] ${message}`, error);
      } else {
        console.error(`[ERROR] ${message}`);
      }
    }
  }

  warn(message: string, context?: unknown): void {
    if (isDevMode()) {
      if (context) {
        console.warn(`[WARN] ${message}`, context);
      } else {
        console.warn(`[WARN] ${message}`);
      }
    }
  }

  info(message: string, context?: unknown): void {
    if (isDevMode()) {
      if (context) {
        console.log(`[INFO] ${message}`, context);
      } else {
        console.log(`[INFO] ${message}`);
      }
    }
  }

  debug(message: string, context?: unknown): void {
    if (isDevMode()) {
      if (context) {
        console.debug(`[DEBUG] ${message}`, context);
      } else {
        console.debug(`[DEBUG] ${message}`);
      }
    }
  }
}

