// Mock EventSource for tests
// @ts-ignore
globalThis.EventSource = class EventSource {
  onmessage: any;
  onerror: any;
  onopen: any;
  readyState: number = 0;
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(url: string) {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  close() {}
} as any;

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() { return; }
  unobserve() { return; }
  disconnect() { return; }
};
