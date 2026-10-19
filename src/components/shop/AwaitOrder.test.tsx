// @vitest-environment jsdom
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const refresh = vi.fn();
const getApi = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
vi.mock('@/lib/api', () => ({ getApi: (...args: unknown[]) => getApi(...args) }));

const { AwaitOrder } = await import('./AwaitOrder');

describe('AwaitOrder', () => {
  beforeEach(() => { vi.useFakeTimers(); refresh.mockReset(); getApi.mockReset(); });
  afterEach(() => { vi.useRealTimers(); });

  it('asks again until the webhook has booked the order, then renders the page anew', async () => {
    getApi.mockRejectedValueOnce(new Error('Order not found.')).mockResolvedValueOnce({ number: 7, items: [] });
    render(<AwaitOrder sessionId="cs_test_1" />);
    await act(async () => { await vi.advanceTimersByTimeAsync(1500); });
    expect(refresh).not.toHaveBeenCalled();
    await act(async () => { await vi.advanceTimersByTimeAsync(1500); });
    expect(getApi).toHaveBeenCalledTimes(2);
    expect(getApi).toHaveBeenLastCalledWith('order', { session_id: 'cs_test_1' });
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('gives up after eight tries', async () => {
    getApi.mockRejectedValue(new Error('Order not found.'));
    render(<AwaitOrder sessionId="cs_test_2" />);
    await act(async () => { await vi.advanceTimersByTimeAsync(30_000); });
    expect(getApi).toHaveBeenCalledTimes(8);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('stops asking once the page is left', async () => {
    getApi.mockRejectedValue(new Error('Order not found.'));
    const { unmount } = render(<AwaitOrder sessionId="cs_test_3" />);
    unmount();
    await act(async () => { await vi.advanceTimersByTimeAsync(30_000); });
    expect(getApi).not.toHaveBeenCalled();
  });
});
