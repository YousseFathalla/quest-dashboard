
import { jest } from '@jest/globals';
import streamManager from '../utils/stream-manager.js';

describe('Stream Manager', () => {
    let mockResponse;

    beforeEach(() => {
        // Clear clients before each test if possible, but it's a singleton.
        // We can access the set directly if needed, or just rely on addClient returning a remove function.
        streamManager.clients.clear();

        mockResponse = {
            write: jest.fn(),
            writable: true,
            finished: false
        };
    });

    it('should add a client and return a remove function', () => {
        const removeClient = streamManager.addClient(mockResponse);
        expect(streamManager.clients.has(mockResponse)).toBe(true);

        removeClient();
        expect(streamManager.clients.has(mockResponse)).toBe(false);
    });

    it('should broadcast data to all clients', () => {
        streamManager.addClient(mockResponse);
        const event = { id: 1, type: 'test' };

        streamManager.broadcast(event);

        expect(mockResponse.write).toHaveBeenCalledWith(`data: ${JSON.stringify(event)}\n\n`);
    });

    it('should remove client if write fails', () => {
        mockResponse.write.mockImplementation(() => {
            throw new Error('Write failed');
        });

        // Suppress console.error for this test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        streamManager.addClient(mockResponse);
        streamManager.broadcast({ id: 1 });

        expect(streamManager.clients.has(mockResponse)).toBe(false);

        consoleSpy.mockRestore();
    });

    it('should remove client if not writable or finished', () => {
        const client1 = { ...mockResponse, writable: false };
        const client2 = { ...mockResponse, finished: true };

        streamManager.addClient(client1);
        streamManager.addClient(client2);

        streamManager.broadcast({ id: 1 });

        expect(streamManager.clients.has(client1)).toBe(false);
        expect(streamManager.clients.has(client2)).toBe(false);
    });
});
