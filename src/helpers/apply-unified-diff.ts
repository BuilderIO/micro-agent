import { parsePatch, applyPatch } from 'diff';

export function applyUnifiedDiff(diff: string, fileContent: string): string {
  const parsedDiff = parsePatch(diff);
  let str = fileContent;
  console.log('parsedDiff', parsedDiff);
  for (const patch of parsedDiff) {
    const result = applyPatch(fileContent, patch);
    if (result === false) {
      console.log('could NOT apply a patch', patch), patch.hunks;
      throw new Error('Failed to apply patch');
    } else {
      console.log('applied a patch', patch);
    }
    str = result;
  }
  return str;
}
