import * as ts from 'typescript';

interface ConditionResult {
  condition: string;
  result: string;
}

function extractTernaryConditions(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  conditions: ConditionResult[]
): void {
  if (ts.isConditionalExpression(node)) {
    const condition = node.condition.getText(sourceFile).trim();
    const whenTrue = node.whenTrue.getText(sourceFile).trim();
    const whenFalse = node.whenFalse;

    conditions.push({ condition, result: whenTrue });

    if (ts.isConditionalExpression(whenFalse)) {
      extractTernaryConditions(whenFalse, sourceFile, conditions);
    } else {
      conditions.push({ condition: 'else', result: whenFalse.getText(sourceFile).trim() });
    }
  }
}

function simplify(inputCode: string): string {
  const sourceFile = ts.createSourceFile('temp.ts', inputCode, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const conditions: ConditionResult[] = [];

  ts.forEachChild(sourceFile, node => extractTernaryConditions(node, sourceFile, conditions));

  if (conditions.length === 0) {
    return inputCode;
  }

  const resultCountMap: Record<string, Set<string>> = {};
  conditions.forEach(({ condition, result }) => {
    if (!resultCountMap[result]) {
      resultCountMap[result] = new Set();
    }
    if (condition !== 'else') {
      resultCountMap[result].add(condition);
    }
  });

  const primaryResult = Object.keys(resultCountMap).reduce((a, b) => (resultCountMap[a].size >= resultCountMap[b].size ? a : b));
  const secondaryResult = primaryResult === 'else' ? '' : '';

  if (resultCountMap[primaryResult].size === 0) {
    return `${primaryResult}`;
  }

  const uniqueConditions = Array.from(resultCountMap[primaryResult]);
  const simplifiedConditions = uniqueConditions.map(c => `(${c})`).join(' || ');

  return `${simplifiedConditions} ? ${primaryResult} : ${secondaryResult}`;
}

export { simplify };