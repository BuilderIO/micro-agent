import { log, note, text } from '@clack/prompts';
import { ExecaError, execaCommand } from 'execa';
import { exitOnCancel } from './exit-on-cancel';
import { isInvalidCommand } from './test';
import { gray } from 'kolorist';

export async function iterateOnTestCommand({
  testCommand,
}: {
  testCommand: string;
}) {
  const result = execaCommand(testCommand).catch((err) => err);
  const final = await result;
  if (isInvalidCommand(final.stderr)) {
    log.error('Your test command is invalid. Please try again.');
    log.message(
      `Your test script output:\n${(final.stderr || final.message)
        .split('\n')
        .map(gray)
        .join('\n')}`
    );

    const newTestCommand = exitOnCancel(
      await text({
        message: 'What command should I run to test the code?',
        defaultValue: testCommand,
        placeholder: testCommand,
      })
    );

    return iterateOnTestCommand({ testCommand: newTestCommand });
  } else {
    return testCommand;
  }
}
