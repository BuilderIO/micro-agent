import * as ts from 'typescript';

export function simplify(inputCode: string): string {
  const sourceFile = ts.createSourceFile('temp.tsx', inputCode, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  let commonResult = '';
  let variantResult = '';
  const conditionMap: Map<string, string> = new Map();

  function collectTernaries(node: ts.Node) {
    if (ts.isConditionalExpression(node)) {
      const condition = node.condition.getText(sourceFile).trim();
      const whenTrue = node.whenTrue.getText(sourceFile).trim();
      const whenFalse = node.whenFalse;
  
      const typeMatch = condition.match(/type === ['"](.*?)['"]/);
      const statusMatch = condition.match(/status === ['"](.*?)['"]/);
  
      if (typeMatch && statusMatch) {
        const key = `${typeMatch[1]} && ${statusMatch[1]}`;
        conditionMap.set(key, whenTrue);
        
        if (!commonResult) {
          commonResult = whenTrue;
        }
        if (commonResult !== whenTrue) {
          variantResult = whenTrue;
        }
      }
  
      if (ts.isConditionalExpression(whenFalse)) {
        collectTernaries(whenFalse);
      } else {
        const elseResult = whenFalse.getText(sourceFile).trim();
        if (!commonResult) {
          commonResult = elseResult;
        }
      }
    }
  }

  collectTernaries(sourceFile);

  if (variantResult) {
    const typeCondition = Array.from(conditionMap.keys()).find(key => key.startsWith("With Icon &&"));
    return `type === 'With Icon' ? ${variantResult} : ${commonResult}`;
  }

  return inputCode;
}