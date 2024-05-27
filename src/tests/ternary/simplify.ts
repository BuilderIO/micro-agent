import * as ts from 'typescript';

export function simplify(inputCode: string): string {
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    inputCode,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  return simplifiedCode;
}
