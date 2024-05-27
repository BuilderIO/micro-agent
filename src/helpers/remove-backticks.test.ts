import { test, expect } from 'vitest';
import { removeBackticks } from './remove-backticks';

test('should remove backticks', () => {
  expect(removeBackticks('```\nhello\n```')).toBe('hello');
  expect(removeBackticks('```typescript\nhello\nworld\n```')).toBe(
    'hello\nworld'
  );
  expect(removeBackticks('```js\nhello\nworld\n```')).toBe('hello\nworld');
});
