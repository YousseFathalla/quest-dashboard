
import 'resize-observer-polyfill';

// Mock EventSource
class MockEventSource {
    onmessage: ((event: any) => void) | null = null;
    onerror: ((event: any) => void) | null = null;
    close() {}
    constructor(url: string) {
        // Simulate connection
        setTimeout(() => {
            if (this.onmessage) {
                // this.onmessage({ data: 'connected' });
            }
        }, 10);
    }
}
(window as any).EventSource = MockEventSource;

// Mock ResizeObserver if polyfill doesn't work automatically (sometimes needed for JSDOM)
(window as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
};
