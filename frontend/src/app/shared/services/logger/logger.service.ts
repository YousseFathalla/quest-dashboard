/**
 * @fileoverview Application logger service.
 * Provides logging methods that only output to the console in development mode.
 */

import { Injectable, isDevMode } from '@angular/core';

@Injectable({ providedIn: 'root'})
export class LoggerService {
  /**
   * Logs an error message.
   *
   * @param {string} message - The error message.
   * @param {unknown} [error] - The error object or context.
   */
  error(message: string, error?: unknown): void {
    if (isDevMode()) {
      if (error) {
        console.error(`[ERROR] ${message}`, error);
      } else {
        console.error(`[ERROR] ${message}`);
      }
    }
  }

  /**
   * Logs a warning message.
   *
   * @param {string} message - The warning message.
   * @param {unknown} [context] - Additional context.
   */
  warn(message: string, context?: unknown): void {
    if (isDevMode()) {
      if (context) {
        console.warn(`[WARN] ${message}`, context);
      } else {
        console.warn(`[WARN] ${message}`);
      }
    }
  }

  /**
   * Logs an informational message.
   *
   * @param {string} message - The info message.
   * @param {unknown} [context] - Additional context.
   */
  info(message: string, context?: unknown): void {
    if (isDevMode()) {
      if (context) {
        console.log(`[INFO] ${message}`, context);
      } else {
        console.log(`[INFO] ${message}`);
      }
    }
  }

  /**
   * Logs a debug message.
   *
   * @param {string} message - The debug message.
   * @param {unknown} [context] - Additional context.
   */
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
