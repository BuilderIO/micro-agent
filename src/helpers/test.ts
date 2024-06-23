import { ExecaError, execaCommand } from 'execa';
import { gray, green, red } from 'kolorist';
import { RunOptions, createCommandString } from './run';
import { outro } from '@clack/prompts';

type Fail = {
  type: 'fail';
  message: string;
};

type Success = {
  type: 'success';
};

type Result = Fail | Success;

const prevTestFailures: string[] = [];

// Check if the last n failures had the same message
const hasFailedNTimesWithTheSameMessage = (message: string, n = 4) => {
  if (prevTestFailures.length < n) {
    return false;
  }

  // If the last n failures had the same message, return true
  return prevTestFailures
    .slice(prevTestFailures.length - n, prevTestFailures.length)
    .every((msg) => msg === message);
};

export const fail = (message: string) => {
  return {
    type: 'fail',
    message,
  } as const;
};

const testFail = (message: string, options: RunOptions) => {
  prevTestFailures.push(message);
  if (hasFailedNTimesWithTheSameMessage(message)) {
    if (!options.addedLogs) {
      options.addedLogs = true;
      return fail('Repeated test failures detected. Adding logs to the code.');
    } else {
      outro(
        red(
          'Your test command is failing with the same error several times. Please make sure your test command is correct. Aborting...'
        )
      );
      console.log(
        `${green('To continue, run:')}\n${gray(
          `${createCommandString(options)}`
        )}\n`
      );
      process.exit(1);
    }
  }
  return fail(message);
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

export const isInvalidCommand = (output: string) => {
  return (
    output.includes('command not found:') ||
    output.includes('command_not_found:') ||
    output.includes('npm ERR! Missing script:')
  );
};

const exitOnInvalidCommand = (output: string) => {
  if (isInvalidCommand(output)) {
    outro(red('Your test command is invalid. Please try again.'));
    process.exit(1);
  }
};

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
    if (final.stderr) {
      exitOnInvalidCommand(final.stderr);
    }
    process.stdout.write('\n');
    endTimer();

    if (final.failed) {
      return testFail(final.stderr, options);
    }
    return success();
  } catch (error: any) {
    process.stdout.write('\n');
    endTimer();
    if (error instanceof ExecaError) {
      exitOnInvalidCommand(error.stderr || error.message);
      return testFail(error.stderr || error.message, options);
    }
    return testFail(error.message, options);
  }
}
