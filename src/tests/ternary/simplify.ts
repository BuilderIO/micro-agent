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
 const valueMap = new Map<string, Set<string>>();
 let defaultValue = '';

 for (const { condition, value } of parts) {
   if (condition === 'default') {
     defaultValue = value;
   } else {
     if (!valueMap.has(value)) {
       valueMap.set(value, new Set());
     }
     valueMap.get(value)?.add(condition);
   }
 }

 const [primaryValue, primaryConditions] = Array.from(valueMap.entries()).reduce(
   (max, curr) => (curr[1].size > max[1].size ? curr : max),
   ['', new Set<string>()]
 );

 const primaryConditionStr = Array.from(primaryConditions).join(' || ');
 const otherConditions = Array.from(valueMap.entries())
   .filter(([value]) => value !== primaryValue)
   .map(
     ([value, conditions]) => `(${Array.from(conditions).join(' || ')}) ? ${value}`
   )
   .join(' : ');

 let simpleTernary = primaryConditions.size
   ? `(${primaryConditionStr}) ? ${primaryValue}`
   : '';
 if (simpleTernary && otherConditions) {
   simpleTernary += ` : ${otherConditions}`;
 } else if (otherConditions) {
   simpleTernary = otherConditions;
 }

 return simpleTernary || defaultValue;
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