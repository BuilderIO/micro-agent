import { test, expect } from 'vitest';
import { removeInitialSlash } from './remove-initial-slash';

test('removes initial slash from an absolute path', () => {
  expect(removeInitialSlash('/absolute/path')).toBe('absolute/path');
  expect(removeInitialSlash('/')).toBe('');
  expect(removeInitialSlash('/another/path/with/multiple/segments')).toBe(
    'another/path/with/multiple/segments'
  );
  expect(removeInitialSlash('/singlefolder')).toBe('singlefolder');
});

test('returns the same string if the path is already relative', () => {
  expect(removeInitialSlash('relative/path')).toBe('relative/path');
  expect(removeInitialSlash('another/relative/path')).toBe(
    'another/relative/path'
  );
  expect(removeInitialSlash('justonefolder')).toBe('justonefolder');
  expect(removeInitialSlash('relative')).toBe('relative');
});

test('handles empty string input', () => {
  expect(removeInitialSlash('')).toBe('');
});
