import * as ts from 'typescript';

interface ConditionalObject {
  condition: string;
  result: string;
}

function extractTernaries(node: ts.Node, sourceFile: ts.SourceFile, ternaries: ConditionalObject[]): void {
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

function combineConditions(conditions: string[]): string {
  return conditions.length > 1 ? `(${conditions.join(' || ')})` : conditions[0];
}

function removeRedundantConditions(conditions: string[]): string[] {
  return [...new Set(conditions)];
}

function groupConditionsByResult(ternaries: ConditionalObject[]): Record<string, string[]> {
  const resultMap: Record<string, string[]> = {};
  ternaries.forEach(({ condition, result }) => {
    if (!resultMap[result]) {
      resultMap[result] = [];
    }
    if (condition !== 'else') {
      resultMap[result].push(condition);
    }
  });
  return resultMap;
}

function getSimpleCondition(resultMap: Record<string, string[]>): string {
  const keys = Object.keys(resultMap);
  if (keys.length === 1) {
    const soleKey = keys[0];
    return `${combineConditions(removeRedundantConditions(resultMap[soleKey])) ? combineConditions(removeRedundantConditions(resultMap[soleKey])) + ' ? ' : ''}${soleKey}`;
  }

  if (keys.length === 0) {
    throw new Error("No conditions found to simplify.");
  }

  const mostFrequentResult = keys.reduce(
    (a, b) => (resultMap[a].length > resultMap[b].length ? a : b)
  );

  const simplifiedTernaryParts = keys
    .filter((result) => result !== mostFrequentResult)
    .map((result) => {
      const combinedConditions = combineConditions(removeRedundantConditions(resultMap[result]));
      return `${combinedConditions} ? ${result} :`;
    });

  return `${simplifiedTernaryParts.join(' ')} ${mostFrequentResult}`;
}

export function simplify(inputCode: string): string {
  const sourceFile = ts.createSourceFile('temp.tsx', inputCode, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const ternaries: ConditionalObject[] = [];

  ts.forEachChild(sourceFile, (node) => extractTernaries(node, sourceFile, ternaries));

  const resultMap = groupConditionsByResult(ternaries);
  return getSimpleCondition(resultMap);
}