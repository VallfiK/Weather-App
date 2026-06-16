import { describe, it, expect } from 'vitest';
import { pluralRu } from './plural';

describe('pluralRu', () => {
  it('uses form [0] for numbers ending in 1 (except 11)', () => {
    expect(pluralRu(1, ['день', 'дня', 'дней'])).toBe('день');
    expect(pluralRu(21, ['день', 'дня', 'дней'])).toBe('день');
    expect(pluralRu(101, ['день', 'дня', 'дней'])).toBe('день');
  });
  it('uses form [1] for 2..4 (except 12..14)', () => {
    expect(pluralRu(2, ['день', 'дня', 'дней'])).toBe('дня');
    expect(pluralRu(3, ['день', 'дня', 'дней'])).toBe('дня');
    expect(pluralRu(4, ['день', 'дня', 'дней'])).toBe('дня');
    expect(pluralRu(22, ['день', 'дня', 'дней'])).toBe('дня');
  });
  it('uses form [2] for 0, 5..20, 25..30, 11..14', () => {
    expect(pluralRu(0, ['день', 'дня', 'дней'])).toBe('дней');
    expect(pluralRu(5, ['день', 'дня', 'дней'])).toBe('дней');
    expect(pluralRu(11, ['день', 'дня', 'дней'])).toBe('дней');
    expect(pluralRu(12, ['день', 'дня', 'дней'])).toBe('дней');
    expect(pluralRu(14, ['день', 'дня', 'дней'])).toBe('дней');
    expect(pluralRu(20, ['день', 'дня', 'дней'])).toBe('дней');
  });
});
