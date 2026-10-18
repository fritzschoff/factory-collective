// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { HydrationMark } from './HydrationMark';

describe('HydrationMark', () => {
  afterEach(() => delete document.documentElement.dataset.hydrated);

  it('renders nothing and does not touch <html> while the page is only server HTML', () => {
    expect(renderToString(<HydrationMark />)).toBe('');
    expect(document.documentElement).not.toHaveAttribute('data-hydrated');
  });

  it('marks <html> once it runs in the browser', () => {
    const { container } = render(<HydrationMark />);
    expect(container).toBeEmptyDOMElement();
    expect(document.documentElement).toHaveAttribute('data-hydrated', '1');
  });
});
