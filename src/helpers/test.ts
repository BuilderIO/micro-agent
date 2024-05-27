import { execaCommand } from 'execa';

type Fail = {
  type: 'fail';
  message: string;
};

type Success = {
  type: 'success';
};

type Result = Fail | Success;

const fail = (message: string) => {
  return {
    type: 'fail',
    message,
  } as const;
};

const success = () => {
  return {
    type: 'success',
  } as const;
};

export const isFail = (result: unknown): result is Fail => {
  return (result as any)?.type === 'fail';
};

export async function test(testScript: string): Promise<Result> {
  try {
    const result = await execaCommand(testScript, {
      shell: process.env.SHELL || true,
      stdio: 'inherit',
    });

    if (result.stderr) {
      return fail(result.stderr);
    }
    return success();
  } catch (error: any) {
    return fail(error.message);
  }
}
