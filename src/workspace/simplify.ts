import * as ts from 'typescript';

interface ConditionalObject {
  condition: string;
  result: string;
}

function extractTernaries(
  node: ts.Node, 
  sourceFile: ts.SourceFile, 
  ternaries: ConditionalObject[]
): void {
  if (ts.isConditionalExpression(node)) {
    const condition = node.condition.getText(sourceFile).trim();
    const whenTrue = node.whenTrue.getText(sourceFile).trim();
    const whenFalse = node.whenFalse;

    ternaries.push({ condition, result: whenTrue });

    if (ts.isConditionalExpression(whenFalse)) {
      extractTernaries(whenFalse, sourceFile, ternaries);
    } else {
      const elseResult = whenFalse.getText(sourceFile).trim();
      ternaries.push({ condition: 'else', result: elseResult });
    }
  }
}

function simplifyConditions(ternaries: ConditionalObject[]): string {
  const resultMap: { [key: string]: string[] } = {};

  ternaries.forEach(({ condition, result }) => {
    if (!resultMap[result]) {
      resultMap[result] = [];
    }
    resultMap[result].push(condition);
  });

  const keys = Object.keys(resultMap);
  if (keys.length === 1) {
    return `${keys[0]}`;
  }

  const mostFrequentResult = keys.reduce(
    (a, b) => (resultMap[a].length > resultMap[b].length ? a : b),
    ''
  );

  const simplifiedTernaryParts: string[] = [];
  keys.forEach((result) => {
    if (result !== mostFrequentResult) {
      const combinedConditions = resultMap[result]
        .filter((cond) => cond !== 'else')
        .join(' || ');
      if (combinedConditions) {
        simplifiedTernaryParts.push(`(${combinedConditions}) ? ${result}`);
      }
    }
  });

  return `(${simplifiedTernaryParts.join(' : ')}) : ${mostFrequentResult}`;
}

export function simplify(inputCode: string): string {
  const sourceFile = ts.createSourceFile(
    'temp.tsx',
    inputCode,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const ternaries: ConditionalObject[] = [];

  ts.forEachChild(sourceFile, (node) =>
    extractTernaries(node, sourceFile, ternaries)
  );

  return simplifyConditions(ternaries);
}