import * as ts from 'typescript';

export function simplify(inputCode: string): string {
  const sourceFile = ts.createSourceFile('temp.ts', inputCode, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  interface ConditionEvaluation {
    condition: ts.Expression;
    whenTrue: ts.Expression;
    whenFalse: ts.Expression;
  }

  function collectTernaryConditions(node: ts.Node): ConditionEvaluation[] {
    const conditions: ConditionEvaluation[] = [];

    function traverse(node: ts.Node) {
      if (ts.isConditionalExpression(node)) {
        const whenTrue = node.whenTrue;
        const whenFalse = node.whenFalse;
        const condition = node.condition;

        conditions.push({ condition, whenTrue, whenFalse });
        traverse(whenTrue);
        traverse(whenFalse);
      }
      ts.forEachChild(node, traverse);
    }

    traverse(node);
    return conditions;
  }

  function parseCondition(condition: ts.Expression): Record<string, Set<string>> {
    const result: Record<string, Set<string>> = {};

    function addCondition(expression: ts.Expression) {
      if (ts.isBinaryExpression(expression)) {
        const key = expression.left.getText();
        const value = expression.right.getText().replace(/['"]/g, '');
        if (!result[key]) {
          result[key] = new Set();
        }
        result[key].add(value);
      }
    }

    function traverse(expression: ts.Expression) {
      if (ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
        traverse(expression.left);
        traverse(expression.right);
      } else {
        addCondition(expression);
      }
    }

    traverse(condition);
    return result;
  }

  function simplifyConditions(conditions: ConditionEvaluation[]): string {
    const trueValues = new Set<string>();
    const falseValues = new Set<string>();
    const conditionMap = new Map<string, string>();

    conditions.forEach(({ condition, whenTrue, whenFalse }) => {
      const parsedCondition = parseCondition(condition);
      const key = Object.keys(parsedCondition)[0];
      conditionMap.set(key, key);

      const trueText = whenTrue.getText();
      trueValues.add(trueText);

      const falseText = whenFalse?.getText();
      falseValues.add(falseText);
    });

    if (trueValues.size === 1 && falseValues.size === 1) {
      const [key] = conditionMap.keys();
      const trueValue = Array.from(trueValues)[0];
      const falseValue = Array.from(falseValues)[0];

      return `${key} === 'With Icon' ? ${trueValue} : ${falseValue}`;
    }

    return inputCode;
  }

  const ternaryConditions = collectTernaryConditions(sourceFile);
  const simplifiedCode = simplifyConditions(ternaryConditions);

  return simplifiedCode;
}