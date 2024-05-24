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
  } else {
    ts.forEachChild(node, child => extractTernaries(child, sourceFile, ternaries));
  }
}

function simplify(inputCode: string): string {
  const sourceFile = ts.createSourceFile('temp.tsx', inputCode, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const ternaries: ConditionalObject[] = [];

  extractTernaries(sourceFile, sourceFile, ternaries);

  if (ternaries.length === 0) return inputCode;

  const resultMap: Record<string, Set<string>> = {};

  ternaries.forEach(({ condition, result }) => {
    if (!resultMap[result]) resultMap[result] = new Set();
    if (condition === 'else') {
      resultMap[result].add('1');
    } else {
      resultMap[result].add(condition);
    }
  });

  const primaryResult = Object.keys(resultMap)
    .reduce((a, b) => (resultMap[a].size > resultMap[b].size ? a : b));

  if (resultMap[primaryResult].size === 1 && resultMap[primaryResult].has('1')) {
    return primaryResult;
  }

  const primaryConditions = Array.from(resultMap[primaryResult]);

  if (primaryConditions.length === 1 && primaryConditions[0] === '1') {
    return primaryResult;
  }

  const simplifiedConditions = primaryConditions.filter(cond => cond !== '1').join(' || ');

  const remainingResults = Object.keys(resultMap)
    .filter(res => res !== primaryResult)
    .map(res => {
      const conditions = Array.from(resultMap[res]).filter(cond => cond !== '1').join(' || ');
      return conditions ? `${conditions} ? ${res}` : res;
    });

  return simplifiedConditions ? `${simplifiedConditions} ? ${primaryResult} : ${remainingResults.join(' : ')}` : `${primaryResult} : ${remainingResults.join(' : ')}`;
}

export { simplify };