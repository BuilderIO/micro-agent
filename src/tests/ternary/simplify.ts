import * as ts from 'typescript';

export function simplify(inputCode: string): string {
  const sourceFile = ts.createSourceFile('temp.ts', inputCode, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  function getNodeText(node: ts.Node): string {
    return node.getText(sourceFile).trim();
  }

  function parseTernary(node: ts.Node): [Map<string, string>, string | null] {
    const map = new Map<string, string>();
    let defaultValue: string | null = null;

    function traverse(node: ts.Node): void {
      if (ts.isConditionalExpression(node)) {
        const condition = getNodeText(node.condition);
        const whenTrue = getNodeText(node.whenTrue);
        const whenFalse = node.whenFalse;

        map.set(condition, whenTrue);
        traverse(whenFalse);
      } else {
        defaultValue = getNodeText(node);
      }
    }

    traverse(node);
    return [map, defaultValue];
  }

  function simplifyMap(map: Map<string, string>, defaultValue: string): string {
    const valueToConditions = new Map<string, string[]>();

    for (const [condition, value] of map) {
      if (!valueToConditions.has(value)) {
        valueToConditions.set(value, []);
      }
      valueToConditions.get(value)!.push(condition);
    }

    let mostCommonValue = '';
    let mostCommonCount = 0;

    for (const [value, conditions] of valueToConditions) {
      if (conditions.length > mostCommonCount) {
        mostCommonCount = conditions.length;
        mostCommonValue = value;
      }
    }

    const mostCommonConditions = valueToConditions.get(mostCommonValue)!;
    let combinedCondition: string;

    if (mostCommonConditions.length === 1) {
      combinedCondition = mostCommonConditions[0];
    } else {
      combinedCondition = mostCommonConditions.map(cond => `(${cond})`).join(' || ');
    }

    return `${combinedCondition} ? ${mostCommonValue} : ${defaultValue}`;
  }

  let simplifiedCode = '';

  function visitNode(node: ts.Node) {
    if (ts.isConditionalExpression(node)) {
      const [map, defaultValue] = parseTernary(node);
      simplifiedCode = simplifyMap(map, defaultValue!);
    }
    ts.forEachChild(node, visitNode);
  }

  visitNode(sourceFile);

  return simplifiedCode;
}