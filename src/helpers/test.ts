import { ExecaError, execaCommand } from 'execa';
import { gray } from 'kolorist';
import { RunOptions } from './run';

type Fail = {
  type: 'fail';
  message: string;
};

type Success = {
  type: 'success';
};

type Result = Fail | Success;

export const fail = (message: string) => {
  return {
    type: 'fail',
    message,
  } as const;
};

export const success = () => {
  return {
    type: 'success',
  } as const;
};

export const isFail = (result: unknown): result is Fail => {
  return (result as any)?.type === 'fail';
};

export function formatMessage(message: string): string {
  return gray(message.replaceAll('\n', '\n' + '│   '));
}

export async function test(options: RunOptions): Promise<Result> {
  const testScript = options.testCommand;
  try {
    const result = execaCommand(testScript, {
      shell: process.env.SHELL || true,
    });
    result.stderr.on('data', (data) => {
      process.stderr.write(formatMessage(data.toString()));
    });
    result.stdout.on('data', (data) => {
      process.stdout.write(formatMessage(data.toString()));
    });

    const final = await result;
    process.stdout.write('\n');

    if (final.failed) {
      return fail(final.stderr);
    }
    return success();
  } catch (error: any) {
    process.stdout.write('\n');
    if (error instanceof ExecaError) {
      return fail(error.stderr || error.message);
    }
    return fail(error.message);
  }
}
