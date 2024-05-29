export function removeBackticks(input: string): string {
  return input
    .replace(/[\s\S]*```(\w+)?\n([\s\S]*?)\n```[\s\S]*/gm, '$2')
    .trim();
}
