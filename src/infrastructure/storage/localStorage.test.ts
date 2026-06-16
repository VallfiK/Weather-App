import { describe, it, expect } from 'vitest';
import { readStorage, writeStorage, removeStorage } from './localStorage';

describe('localStorage wrapper', () => {
  it('returns null when nothing is stored', () => {
    expect(readStorage<string>('k')).toBeNull();
  });
  it('round-trips a string', () => {
    writeStorage('k', 'hello');
    expect(readStorage<string>('k')).toBe('hello');
  });
  it('round-trips an object as JSON', () => {
    writeStorage('obj', { a: 1, b: ['x'] });
    expect(readStorage<{ a: number; b: string[] }>('obj')).toEqual({ a: 1, b: ['x'] });
  });
  it('returns null and clears on corrupt JSON', () => {
    localStorage.setItem('bad', '{not json');
    expect(readStorage('bad')).toBeNull();
    expect(localStorage.getItem('bad')).toBeNull();
  });
  it('removes a key', () => {
    writeStorage('k', 'v');
    removeStorage('k');
    expect(readStorage('k')).toBeNull();
  });
  it('survives localStorage throwing (private mode)', () => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => { throw new Error('denied'); };
    try {
      expect(readStorage('any')).toBeNull();
    } finally {
      Storage.prototype.getItem = original;
    }
  });
});
