export function addNumbers(a: any, b: any): number {
  // Validate that both inputs are numbers
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both arguments must be numbers');
  }

  // Return the sum of the two numbers
  return a + b;
}
