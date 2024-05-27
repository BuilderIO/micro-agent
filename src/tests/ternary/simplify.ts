import * as ts from 'typescript';

function simplify(inputCode: string): string {
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    inputCode,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  interface ConditionEvaluation {
    condition: string;
    whenTrue: string;
  }

  function collectTernaryConditions(node: ts.Node): ConditionEvaluation[] {
    const conditions: ConditionEvaluation[] = [];

    function traverse(node: ts.Node) {
      if (ts.isConditionalExpression(node)) {
        const condition = node.condition.getText().trim();
        const whenTrue = node.whenTrue.getText().trim();
        conditions.push({ condition, whenTrue });
        traverse(node.whenFalse);
      } else {
        ts.forEachChild(node, traverse);
      }
    }

    traverse(node);
    return conditions;
  }

  function simplifyConditions(
    conditions: ConditionEvaluation[]
  ): string | null {
    const conditionMap: Record<string, Set<string>> = {};
    const resultMap: Record<string, string[]> = {};
    const finalResultSet = new Set<string>();

    conditions.forEach(({ condition, whenTrue }) => {
      const conditionParts = condition.split(' && ');

      if (!resultMap[whenTrue]) {
        resultMap[whenTrue] = [];
      }
      resultMap[whenTrue].push(condition);
      finalResultSet.add(whenTrue);

      conditionParts.forEach((part) => {
        const [key, val] = part
          .split(' === ')
          .map((s) => s.trim().replace(/['"]/g, ''));
        if (!conditionMap[key]) {
          conditionMap[key] = new Set();
        }
        conditionMap[key].add(val);
      });
    });

    if (finalResultSet.size === 1) {
      return Array.from(finalResultSet)[0];
    }

    let primaryKey = '';
    for (const key in conditionMap) {
      if (conditionMap[key].size > 1) {
        primaryKey = key;
        break;
      }
    }

    if (!primaryKey) {
      return null;
    }

    const primaryResult = Array.from(finalResultSet).find(
      (res) => res !== resultMap[primaryKey][0]
    );
    const primaryConditions = Array.from(conditionMap[primaryKey])
      .map((val) => `${primaryKey} === '${val}'`)
      .join(' || ');

    return `${primaryConditions} ? ${resultMap[primaryKey][0]} : ${primaryResult}`;
  }

  const ternaryConditions = collectTernaryConditions(sourceFile);
  const conditionAnalysis = simplifyConditions(ternaryConditions);

  if (conditionAnalysis) {
    return conditionAnalysis;
  }

  return inputCode;
}

export { simplify };
