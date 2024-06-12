import { ExecaError, execaCommand } from 'execa';
import { gray, red } from 'kolorist';
import { RunOptions } from './run';
import { outro } from '@clack/prompts';

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
  let timeout: NodeJS.Timeout;
  const timeoutSeconds = 20;
  const resetTimer = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      console.log('\n');
      outro(
        red(
          `No test output for ${timeoutSeconds} seconds. Is your test command running in watch mode? If so, make sure to use a test command that exits after running the tests.`
        )
      );

      process.exit(0);
    }, timeoutSeconds * 1000);
  };
  const endTimer = () => {
    clearTimeout(timeout);
  };

  resetTimer();

  const testScript = options.testCommand;
  try {
    const result = execaCommand(testScript, {
      shell: process.env.SHELL || true,
    });
    result.stderr.on('data', (data) => {
      process.stderr.write(formatMessage(data.toString()));
      resetTimer();
    });
    result.stdout.on('data', (data) => {
      process.stdout.write(formatMessage(data.toString()));
      resetTimer();
    });

    const final = await result;
    process.stdout.write('\n');
    endTimer();

    if (final.failed) {
      return fail(final.stderr);
    }
    return success();
  } catch (error: any) {
    process.stdout.write('\n');
    endTimer();
    if (error instanceof ExecaError) {
      return fail(error.stderr || error.message);
    }
    return fail(error.message);
  }
}
