export function removeBackticks(input: string): string {
  return input.replace(/```/g, '');
}