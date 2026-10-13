import { describe, expect, it } from 'vitest';
import { worldOf } from './world';

describe('worldOf', () => {
  it('reads the room from the first segment', () => {
    expect(worldOf('/atelier/fashion/sh-001/')).toBe('atelier');
    expect(worldOf('/factory/')).toBe('factory');
    expect(worldOf('/campaigns/01/')).toBe('campaigns');
  });
  it('contact belongs to About', () => {
    expect(worldOf('/contact/')).toBe('about');
  });
  it('pages outside the rooms have none', () => {
    expect(worldOf('/')).toBeNull();
    expect(worldOf('/bag/')).toBeNull();
    expect(worldOf(null)).toBeNull();
  });
});
