import { test, expect } from 'vitest';
import { removeBackticks } from './remove-backticks';

// Remove backticks from a string, for instance to remove the
// markdown backticks (+ language name) around code returned that
// should just be that code
test('should remove backticks', () => {
  expect(removeBackticks('```\nhello\n```')).toBe('hello');
  expect(removeBackticks('```typescript\nhello\nworld\n```')).toBe(
    'hello\nworld'
  );
  expect(removeBackticks('```js\nhello\nworld\n```')).toBe('hello\nworld');
});
