export function removeBackticks(input: string): string {
  return input.replace(/^```(\w+)?\n([\s\S]*?)\n```$/gm, '$2').trim();
}