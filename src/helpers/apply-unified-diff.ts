import { parsePatch, applyPatch, ParsedDiff } from 'diff';

function isValidDiff(patches: ParsedDiff[]): boolean {
  return patches.every(patch => patch.hunks.length > 0);
}

export function applyUnifiedDiff(diff: string, fileContent: string): string {
  if (!diff.trim()) return fileContent;

  const patches = parsePatch(diff);

  if (patches.length === 0 || !isValidDiff(patches)) {
    throw new Error('Failed to apply patch');
  }

  let updatedContent = fileContent;

  patches.forEach((patch) => {
    const result = applyPatch(updatedContent, patch);
    if (result === false) {
      throw new Error('Failed to apply patch');
    }
    updatedContent = result;
  });

  return updatedContent;
}