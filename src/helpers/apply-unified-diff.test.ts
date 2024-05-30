import { describe, it, expect } from 'vitest';
import { applyUnifiedDiff } from './apply-unified-diff'; // Adjust the path accordingly

describe('applyUnifiedDiff', () => {
  it('should apply a simple unified diff correctly', () => {
    const diff = `--- a/test.txt
+++ b/test.txt
@@ -1,3 +1,3 @@
-Hello
-World
+Hi
+Universe
 This is a test.`;

    const originalFileContent = `Hello
World
This is a test.`;

    const expectedFileContent = `Hi
Universe
This is a test.`;

    const result = applyUnifiedDiff(diff, originalFileContent);
    expect(result).toBe(expectedFileContent);
  });

  it('should handle an empty diff', () => {
    const diff = '';
    const originalFileContent = 'No changes here.';
    const result = applyUnifiedDiff(diff, originalFileContent);
    expect(result).toBe(originalFileContent);
  });

  it.skip('should throw an error for an invalid diff', () => {
    const diff = 'invalid diff';
    const originalFileContent = 'Original content.';

    expect(() => applyUnifiedDiff(diff, originalFileContent)).toThrow(
      'Failed to apply patch'
    );
  });

  it('should handle multiple changes in the diff', () => {
    const diff = `--- a/test.txt
+++ b/test.txt
@@ -1,5 +1,5 @@
-Hello
+Hi
 World
 This is a test.
-Another line.
+Changed line.`;

    const originalFileContent = `Hello
World
This is a test.
Another line.`;

    const expectedFileContent = `Hi
World
This is a test.
Changed line.`;

    const result = applyUnifiedDiff(diff, originalFileContent);
    expect(result).toBe(expectedFileContent);
  });
});
