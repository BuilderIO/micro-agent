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

function removeRedundantConditions(ternaries: ConditionalObject[]): ConditionalObject[] {
  const uniqueConditions = new Set<string>();
  const result = ternaries.filter(({ condition }) => {
    if (uniqueConditions.has(condition)) {
      return false;
    }
    uniqueConditions.add(condition);
    return true;
  });
  return result;
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
    return keys[0];
  }

  const mostFrequentResult = keys.reduce((a, b) => (resultMap[a].length > resultMap[b].length ? a : b));

  const simplifiedTernaryParts = keys
    .filter((result) => result !== mostFrequentResult)
    .map((result) => {
      const combinedConditions = resultMap[result].join(' || ');
      return `(${combinedConditions}) ? ${result} :`;
    });

  return `${simplifiedTernaryParts.join(' ')} ${mostFrequentResult}`;
}

export function simplify(inputCode: string): string {
  inputCode = inputCode.trim().replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ');

  const sourceFile = ts.createSourceFile('temp.tsx', inputCode, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const ternaries: ConditionalObject[] = [];

  ts.forEachChild(sourceFile, (node) => extractTernaries(node, sourceFile, ternaries));

  if (ternaries.length === 0) {
    return inputCode;
  }

  const uniqueTernaries = removeRedundantConditions(ternaries);
  const resultMap = groupConditionsByResult(uniqueTernaries);
  return getSimpleCondition(resultMap).replace(/\s+/g, ' ').trim();
}