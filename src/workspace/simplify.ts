import * as ts from 'typescript';

export function simplify(inputCode: string): string {
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    inputCode,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  // Flatten the nested ternary expression into an array
  function flattenTernary(node: ts.ConditionalExpression, expressions: { condition: string, value: string }[] = []) {
    expressions.push({ condition: node.condition.getText(), value: node.whenTrue.getText() });
    if (ts.isConditionalExpression(node.whenFalse)) {
      flattenTernary(node.whenFalse, expressions);
    } else {
      expressions.push({ condition: '', value: node.whenFalse.getText() });
    }
    return expressions;
  }

  function traverse(node: ts.Node): { condition: string, value: string }[] | undefined {
    if (ts.isConditionalExpression(node)) {
      return flattenTernary(node);
    }
    return ts.forEachChild(node, traverse);
  }

  const ternaryExpressions = traverse(sourceFile);
  if (!ternaryExpressions) return inputCode;

  // Group values by condition
  const valueConditionsMap = new Map<string, string[]>();
  ternaryExpressions.forEach(({ condition, value }) => {
    const conditions = valueConditionsMap.get(value) || [];
    if (condition) conditions.push(condition);
    valueConditionsMap.set(value, conditions);
  });

  // Find the most frequent value
  let mostFrequentValue = '';
  let maxFrequency = 0;
  valueConditionsMap.forEach((conditions, value) => {
    if (conditions.length > maxFrequency) {
      maxFrequency = conditions.length;
      mostFrequentValue = value;
    }
  });

  // Create simplified ternary expression
  const simplifiedConditions: string[] = [];
  valueConditionsMap.forEach((conditions, value) => {
    if (value !== mostFrequentValue) {
      simplifiedConditions.push(`(${conditions.join(' || ')}) ? ${value}`);
    }
  });

  const simplifiedCode = simplifiedConditions.length
    ? `${simplifiedConditions.join(' : ')} : ${mostFrequentValue}`
    : mostFrequentValue;

  return simplifiedCode;
}