// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GalleryClient } from './Gallery';

const slides = ['one', 'two', 'three'].map((text) => <span key={text}>{text}</span>);

describe('Gallery', () => {
  it('arrow keys change the picture and the tab panel follows the selected tab', () => {
    render(<GalleryClient slides={slides} thumbs={slides} overlay={null} />);
    const first = screen.getByRole('tab', { name: 'Picture 1' });
    expect(first).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', first.id);
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    const second = screen.getByRole('tab', { name: 'Picture 2' });
    expect(second).toHaveAttribute('aria-selected', 'true');
    expect(second).toHaveFocus();
    expect(first).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', second.id);
    fireEvent.keyDown(second, { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Picture 3' })).toHaveFocus();
  });
});
