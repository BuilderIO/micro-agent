export function removeBackticks(input: string): string {
  return input.replace(/```[^\n]*\n([\s\S]*?)\n```/g, '$1').trim();
}