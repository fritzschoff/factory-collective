import { describe, expect, it } from 'vitest';
import { subjectFromQuery } from './ContactForm';

describe('subjectFromQuery', () => {
  it('notify-furniture preselects "notify" and keeps the full subject', () => {
    expect(subjectFromQuery('notify-furniture')).toEqual({ key: 'notify', full: 'notify-furniture' });
  });
  it('unknown or missing subjects fall back to general', () => {
    expect(subjectFromQuery('weird')).toEqual({ key: 'general', full: 'weird' });
    expect(subjectFromQuery(null)).toEqual({ key: 'general', full: '' });
  });
});
