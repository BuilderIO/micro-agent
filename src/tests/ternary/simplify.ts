import * as ts from 'typescript';

function simplify(inputCode: string): string {
  const sourceFile = ts.createSourceFile('temp.ts', inputCode, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  interface ConditionEvaluation {
    condition: string;
    whenTrue: string;
  }

  function collectTernaryConditions(node: ts.Node): ConditionEvaluation[] {
    const conditions: ConditionEvaluation[] = [];

    function traverse(node: ts.Node) {
      if (ts.isConditionalExpression(node)) {
        const whenTrue = node.whenTrue.getText().trim();
        const condition = node.condition.getText().trim();
        conditions.push({ condition, whenTrue });
        traverse(node.whenTrue);
        traverse(node.whenFalse);
      }
      ts.forEachChild(node, traverse);
    }

    traverse(node);
    return conditions;
  }

  function analyzeConditions(conditions: ConditionEvaluation[]): string | null {
    const valueToConditions: Record<string, Set<string>> = {};
    const resultToConditions: Record<string, Set<string>> = {};
    const allConditions = new Set<string>();

    conditions.forEach(({ condition, whenTrue }) => {
      if (!valueToConditions[whenTrue]) {
        valueToConditions[whenTrue] = new Set();
      }
      if (!resultToConditions[condition]) {
        resultToConditions[condition] = new Set();
      }
      valueToConditions[whenTrue].add(condition);
      resultToConditions[condition].add(whenTrue);
      allConditions.add(condition);
    });

    if (Object.key(valueToConditions).length === 1) {
      return Array.from(valueToConditions.keys())[0];
    }

    for (const cond in resultToConditions) {
      if (resultToConditions[cond].size === 1) {
        const value = Array.from(resultToConditions[cond])[0];
        const conditionParts = cond.split(' && ').filter((part) => !allConditions.has(part));
        if (conditionParts.length) {
          return `${conditionParts.join(' && ')} ? ${value} : ${Array.from(resultToConditions.keys()).find((v) => v !== value)}`;
        }
      }
    }

    return null;
  }

  const ternaryConditions = collectTernaryConditions(sourceFile);
  const conditionAnalysis = analyzeConditions(ternaryConditions);

  if (conditionAnalysis) {
    return conditionAnalysis;
  }

  return inputCode;
}

export { simplify };