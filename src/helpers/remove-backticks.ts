export function removeBackticks(input: string): string {
  return input.replace(/^```(?:\w*\n)?([\s\S]*?)```$/, '$1').trim();
}
