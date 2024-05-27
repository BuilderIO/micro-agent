import * as ts from 'typescript';

function parseConditions(sourceFile: ts.SourceFile): Array<{ condition: string; value: string }> {
  const conditionValuePairs: Array<{ condition: string; value: string }> = [];

  function visit(node: ts.Node) {
    if (ts.isConditionalExpression(node)) {
      const condition = node.condition.getText(sourceFile);
      const whenTrue = node.whenTrue.getText(sourceFile);
      const whenFalse = node.whenFalse.getText(sourceFile);

      conditionValuePairs.push({ condition, value: whenTrue });

      if (ts.isConditionalExpression(node.whenFalse)) {
        visit(node.whenFalse);
      } else {
        conditionValuePairs.push({ condition: 'default', value: whenFalse });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return conditionValuePairs;
}

function simplifyTernary(parts: Array<{ condition: string; value: string }>): string {
  const valueConditionMap = new Map<string, Set<string>>();
  let defaultValue = '';

  for (const { condition, value } of parts) {
    if (condition === 'default') {
      defaultValue = value;
    } else {
      if (!valueConditionMap.has(value)) {
        valueConditionMap.set(value, new Set());
      }
      valueConditionMap.get(value)?.add(condition);
    }
  }

  const [primaryValue, primaryConditions] = Array.from(valueConditionMap.entries()).reduce(
    (max, curr) => (curr[1].size > max[1].size ? curr : max),
    ['', new Set<string>()]
  );

  if (!primaryValue) return defaultValue;

  const primaryConditionStr = Array.from(primaryConditions).map(cond => `(${cond})`).join(' || ');

  const groupedConditions: Record<string, Set<string>> = {};

  primaryConditions.forEach(cond => {
    const [prefix, suffix] = cond.split(' && ');
    if (!groupedConditions[prefix]) {
      groupedConditions[prefix] = new Set<string>();
    }
    if (suffix) {
      groupedConditions[prefix]?.add(suffix);
    }
  });

  const reducedConditions = Object.entries(groupedConditions)
    .map(([prefix, suffixes]) =>
      suffixes.size
        ? `(${prefix} && (${Array.from(suffixes).join(' || ')}))`
        : prefix
    )
    .join(' || ');

  return `${reducedConditions} ? ${primaryValue} : ${defaultValue}`;
}

export function simplify(inputCode: string): string {
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    inputCode,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  const ternaryParts = parseConditions(sourceFile);
  return simplifyTernary(ternaryParts);
}