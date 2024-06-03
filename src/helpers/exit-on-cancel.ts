import { outro } from '@clack/prompts';

export const exitOnCancel = (value: string | symbol) => {
  if (typeof value === 'symbol') {
    outro('Goodbye!');
    process.exit(0);
  }
  return value;
};
